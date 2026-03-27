const axios = require('axios');

// Fungsi 1: Mengarahkan user ke halaman login GitHub
const loginWithGithub = (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=read:user,repo`;
  res.redirect(githubAuthUrl);
};

// Fungsi 2: Menerima 'code' dari GitHub dan menukarnya dengan Token
const githubCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Tidak ada kode otorisasi dari GitHub" });
  }

  try {
    // Tukar kode dengan access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: 'application/json', // Kita minta balasan dalam format JSON
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Arahkan kembali ke frontend (React) sambil membawa token di URL
    // Nanti React yang akan mengambil token ini dan menyimpannya
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${accessToken}`);
    
  } catch (error) {
    console.error("Error saat menukar token:", error.message);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

module.exports = {
  loginWithGithub,
  githubCallback,
};