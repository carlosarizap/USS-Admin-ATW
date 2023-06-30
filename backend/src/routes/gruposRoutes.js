import express from 'express';
const router = express.Router();
import { Client } from 'ssh2';

const config = {
  host: '192.168.110.130', // IP or domain name of the virtual machine
  port: 22, // SSH port
  username: 'root', // Username of the virtual machine
  password: '123456', // User's password
};

router.get('/getNumByGroup/:groupName', (req, res) => {
    const { groupName } = req.params;
    const conn = new Client();
  
    conn.on('ready', () => {
      // Execute the shell command to get the number of users in the specified group
      conn.exec(`getent group ${groupName} | awk -F: '{print $4}' | tr ',' '\\n' | grep -c .`, (err, stream) => {
        if (err) {
          conn.end();
          return res.status(500).json({ error: 'Error executing command' });
        }
  
        let result = '';
        stream.on('data', (data) => {
          result += data.toString();
        });
  
        stream.on('end', () => {
          const count = parseInt(result.trim());
  
          conn.end();
          res.json({ group: groupName, count });
        });
      });
    });
  
    conn.on('error', (err) => {
      res.status(500).json({ error: 'SSH connection failed' });
    });
  
    // Connect to the remote Linux machine
    conn.connect(config);
  });
  

  export default router;
