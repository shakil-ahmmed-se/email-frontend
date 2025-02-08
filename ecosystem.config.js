module.exports = {
    apps: [
      {
        name: "Email sending Frontend",
        script: "npm",
        args: "start",
        env: {
          PORT: 3001, // Change the port if needed
        //   NODE_ENV: "production",
        },
      },
    ],
  };
  