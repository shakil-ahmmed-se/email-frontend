import LoginForm from "@/components/Login";
import { useState } from "react";

export default function SendEmail() {
  const [formData, setFormData] = useState({
    emails: "",
    subject: "",
    text: "",
    html: "",
  });
  const [message, setMessage] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const [failedEmails, setFailedEmails] = useState([]);
  const [logs, setLogs] = useState([]); // Store logs
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  // sending loading
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const emails = formData.emails
      .split(/[\n,]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emails.length === 0) {
      setMessage("Error: No valid email addresses provided.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://api.misterstorehub.shop/send-bulk-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails,
          subject: formData.subject,
          text: formData.text,
          html: formData.html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send emails");
      }

      const data = await response.json();
      setMessage(data.message);
      setSuccessCount(data.sentSuccessfully);
      setFailedEmails(data.failedEmails);
      console.log("email senging", data.logs.map);
      setLogs(data.logs || []); // Update logs

      setFormData((prev) => ({
        ...prev,
        emails: "",
      }));
    } catch (error) {
      console.error("Error:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false); // Stop loading after request completes
    }
  };

  // Handle login success
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="flex flex-col-1 lg:flex-row  items-start space-y-6 lg:space-y-0 lg:space-x-8">
      {/* Left side: Email form */}
      <div className="lg:w-1/2 mx-auto  p-6 bg-white shadow-xl rounded-lg">
        {!isLoggedIn ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div class="ms-10">
            <h1 className="text-2xl font-bold mb-4">Send Bulk Emails</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="font-medium">
                  Emails (comma or newline separated):
                </label>
                <textarea
                  name="emails"
                  value={formData.emails}
                  onChange={handleChange}
                  required
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="font-medium">Subject:</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="font-medium">Plain Text Message:</label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="font-medium">HTML Message:</label>
                <textarea
                  name="html"
                  value={formData.html}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter HTML content here"
                  rows={4}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 disabled:bg-green-400"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Emails"}
              </button>
            </form>

            {message && (
              <p className="mt-4 text-center text-green-600">{message}</p>
            )}

            {successCount > 0 && (
              <p className="mt-2 text-green-600 text-center">
                Successfully sent: {successCount} emails
              </p>
            )}

            {failedEmails.length > 0 && (
              <div className="mt-2 text-red-600">
                <p className="text-center">
                  Failed to send: {failedEmails.length} emails
                </p>
                <ul className="list-disc list-inside text-sm">
                  {failedEmails.map((email, index) => (
                    <li key={index}>{email}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side: Email Logs */}

      {/* Right side: Email Logs */}
      {isLoggedIn && (
        <div className="lg:w-1/2 p-6 bg-gray-100 shadow-2xl rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">Email Logs</h2>
          {logs.length > 0 ? (
            <div>
              <h3>Total Emails Sent: {logs.length}</h3>
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <p key={index} className="text-green-600 text-sm">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center">No logs available</p>
          )}
        </div>
      )}
    </div>
  );
}
