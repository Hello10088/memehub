module.exports = {
  apps: [{
    name: "memebox",
    script: "./node_modules/.bin/next",
    args: "start -p 3005",
    env: {
      NODE_ENV: "production",
    },
  }],
};
