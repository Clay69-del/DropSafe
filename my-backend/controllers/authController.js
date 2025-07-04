import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const googleAuthLogin = async (req, res) => {
  const { name, email } = req.body; // <- After verifying Google token

  try {
    // ✅ Generate JWT
    const token = jwt.sign(
      { name, email }, // payload
      process.env.JWT_SECRET, // secret
      { expiresIn: '1d' } // options
    );

    // ✅ Return token to frontend
    res.status(200).json({ token, user: { name, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};