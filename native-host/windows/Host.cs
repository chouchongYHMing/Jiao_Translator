using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Web.Script.Serialization;

// Chrome Native Messaging uses a four-byte length followed by UTF-8 JSON.
// This host deliberately accepts only two fixed actions and never executes
// a command supplied by the extension.
internal static class Host
{
    private static readonly JavaScriptSerializer Json = new JavaScriptSerializer();

    private static void Main()
    {
        try
        {
            Dictionary<string, object> request = ReadMessage();
            string action = request.ContainsKey("action") ? request["action"] as string : null;

            if (action == "ping")
            {
                WriteMessage(new { ok = true, status = "ready" });
            }
            else if (action == "start_server")
            {
                StartServer();
            }
            else
            {
                WriteMessage(new { ok = false, error = "Unsupported action." });
            }
        }
        catch (Exception error)
        {
            WriteMessage(new { ok = false, error = error.Message });
        }
    }

    private static Dictionary<string, object> ReadMessage()
    {
        Stream input = Console.OpenStandardInput();
        byte[] header = ReadBytes(input, 4);
        int length = BitConverter.ToInt32(header, 0);
        if (length < 1 || length > 65536)
            throw new InvalidDataException("Invalid native message length.");

        object message = Json.DeserializeObject(Encoding.UTF8.GetString(ReadBytes(input, length)));
        Dictionary<string, object> request = message as Dictionary<string, object>;
        if (request == null)
            throw new InvalidDataException("Invalid native message.");
        return request;
    }

    private static byte[] ReadBytes(Stream stream, int count)
    {
        byte[] result = new byte[count];
        int offset = 0;
        while (offset < count)
        {
            int read = stream.Read(result, offset, count - offset);
            if (read == 0)
                throw new EndOfStreamException("Incomplete native message.");
            offset += read;
        }
        return result;
    }

    private static void WriteMessage(object message)
    {
        byte[] payload = Encoding.UTF8.GetBytes(Json.Serialize(message));
        Stream output = Console.OpenStandardOutput();
        byte[] header = BitConverter.GetBytes(payload.Length);
        output.Write(header, 0, header.Length);
        output.Write(payload, 0, payload.Length);
        output.Flush();
    }

    private static void StartServer()
    {
        string directory = AppDomain.CurrentDomain.BaseDirectory;
        string server = Path.GetFullPath(Path.Combine(directory, "..", "..", "server"));
        string activate = Path.Combine(server, ".venv", "Scripts", "activate.bat");
        string uvicorn = Path.Combine(server, ".venv", "Scripts", "uvicorn.exe");
        string launcher = Path.Combine(directory, "launch-server.cmd");

        if (!File.Exists(activate) || !File.Exists(uvicorn))
        {
            WriteMessage(new { ok = false, error = "Missing server/.venv or uvicorn. Create the virtual environment and install server/requirements.txt first." });
            return;
        }
        if (!File.Exists(launcher))
        {
            WriteMessage(new { ok = false, error = "Launcher file is missing. Run install.ps1 again." });
            return;
        }

        if (IsPortOpen())
        {
            if (IsJiaoServer())
                WriteMessage(new { ok = true, status = "already_running" });
            else
                WriteMessage(new { ok = false, error = "Port 8000 is already in use by another service." });
            return;
        }

        ProcessStartInfo start = new ProcessStartInfo("cmd.exe", "/k launch-server.cmd");
        start.WorkingDirectory = directory;
        start.UseShellExecute = true;
        Process process = Process.Start(start);
        if (process == null)
            throw new InvalidOperationException("Could not open a terminal.");
        WriteMessage(new { ok = true, status = "started" });
    }

    private static bool IsPortOpen()
    {
        using (TcpClient client = new TcpClient())
        {
            IAsyncResult attempt = client.BeginConnect("127.0.0.1", 8000, null, null);
            if (!attempt.AsyncWaitHandle.WaitOne(400))
                return false;
            try
            {
                client.EndConnect(attempt);
                return true;
            }
            catch (SocketException)
            {
                return false;
            }
        }
    }

    private static bool IsJiaoServer()
    {
        try
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:8000/health");
            request.Timeout = 1000;
            request.Proxy = null;
            using (WebResponse response = request.GetResponse())
            using (StreamReader reader = new StreamReader(response.GetResponseStream()))
            {
                Dictionary<string, object> data = Json.DeserializeObject(reader.ReadToEnd()) as Dictionary<string, object>;
                return data != null && data.ContainsKey("ok") && data["ok"] is bool && (bool)data["ok"]
                    && data.ContainsKey("model") && (string)data["model"] == "qwen3:4b-instruct";
            }
        }
        catch
        {
            return false;
        }
    }
}
