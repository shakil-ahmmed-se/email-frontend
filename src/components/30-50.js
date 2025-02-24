import LoginForm from "@/components/Login";
import { useState } from "react";

export default function SendEmail() {
  const [formData, setFormData] = useState({
    emails: "",
    subject: "",
    text: "",
    html: "",
  });
  const [smtpCredentials, setSmtpCredentials] = useState([
    { user: "", pass: "", host: "smtp.gmail.com", port: "587" },
  ]);
  const [message, setMessage] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const [failedEmails, setFailedEmails] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState(null); // State for file attachment

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSmtpChange = (index, field, value) => {
    const updatedCredentials = [...smtpCredentials];
    updatedCredentials[index][field] = value;
    setSmtpCredentials(updatedCredentials);
  };

  const addSmtpCredential = () => {
    setSmtpCredentials([
      ...smtpCredentials,
      { user: "", pass: "", host: "smtp.gmail.com", port: "587" },
    ]);
  };

  const removeSmtpCredential = (index) => {
    const updated = smtpCredentials.filter((_, i) => i !== index);
    setSmtpCredentials(updated);
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]); // Store the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    // Validate SMTP credentials
    if (smtpCredentials.length === 0) {
      setMessage("Error: At least one SMTP credential is required.");
      setIsLoading(false);
      return;
    }
  
    for (const cred of smtpCredentials) {
      if (!cred.user || !cred.pass) {
        setMessage("Error: All SMTP credentials must have an email and password.");
        setIsLoading(false);
        return;
      }
    }
  
    const emails = formData.emails
      .split(/[\n,]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  
    if (emails.length === 0) {
      setMessage("Error: No valid email addresses provided.");
      setIsLoading(false);
      return;
    }
  
    // Create FormData to include the file
    const formDataToSend = new FormData();
    formDataToSend.append("smtp_credentials", JSON.stringify(smtpCredentials));
    formDataToSend.append("emails", JSON.stringify(emails));
    formDataToSend.append("subject", formData.subject);
    formDataToSend.append("text", formData.text);
    formDataToSend.append("html", formData.html);
    if (attachment) {
      formDataToSend.append("attachment", attachment);
    }
    
    // Debug: Log the FormData being sent
    for (const [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }
    // https://api.misterstorehub.shop/send-emails
    try {
      const response = await fetch("http://localhost:3000/send-emails", {
        method: "POST",
        body: formDataToSend,
        credentials: "include", // Include cookies in the request
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error:", errorData); // Debug: Log backend error
        throw new Error(errorData.message || "Failed to send emails");
      }
  
      const data = await response.json();
      setMessage(data.message);
      setSuccessCount(data.sentSuccessfully);
      setFailedEmails(data.failedEmails);
      setLogs(data.logs || []);
  
      setFormData((prev) => ({
        ...prev,
        emails: "",
      }));
      setAttachment(null); // Clear the file input after submission
    } catch (error) {
      console.error("Error:", error); // Debug: Log the error
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="flex flex-col-1 lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
      <div className="lg:w-1/2 mx-auto p-6 bg-white shadow-xl rounded-lg">
        {!isLoggedIn ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="ms-10">
            <h1 className="text-2xl font-bold mb-4">Send Bulk Emails</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SMTP Credentials Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">SMTP Credentials:</h3>
                {smtpCredentials.map((cred, index) => (
                  <div key={index} className="border p-4 rounded-md space-y-2">
                    <div className="flex flex-col space-y-2">
                      <label>Email (User):</label>
                      <input
                        type="email"
                        value={cred.user}
                        onChange={(e) => handleSmtpChange(index, "user", e.target.value)}
                        required
                        className="p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label>App Password:</label>
                      <input
                        type="password"
                        value={cred.pass}
                        onChange={(e) => handleSmtpChange(index, "pass", e.target.value)}
                        required
                        className="p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    {smtpCredentials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSmtpCredential(index)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove Credential
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSmtpCredential}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Add SMTP Credential
                </button>
              </div>

              {/* Email Content Section */}
              <div className="flex flex-col space-y-2">
                <label className="font-medium">Recipient Emails (comma/newline separated):</label>
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

              {/* File Attachment Section */}
              <div className="flex flex-col space-y-2">
                <label className="font-medium">Attachment:</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Results Display */}
            {message && (
              <p className={`mt-4 text-center ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
                {message}
              </p>
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

      {/* Logs Section */}
      {isLoggedIn && (
        <div className="lg:w-1/2 p-6 bg-gray-100 shadow-2xl rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">Email Logs</h2>
          {logs.length > 0 ? (
            <div>
              <h3 className="text-center mb-2">Total Emails Sent: {logs.length}</h3>
              <div className="max-h-[600px] overflow-y-auto space-y-2 border border-gray-300 p-2 rounded-md">
                {logs.map((log, index) => (
                  <p
                    key={index}
                    className={`text-sm p-1 rounded ${log.includes("✅") ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}
                  >
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