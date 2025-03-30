// controllers/matchController.js
const db = require('../config/db');

exports.getMatches = async (req, res) => {
  try {
    const { userId } = req;
    
    const { rows } = await db.query(
      `SELECT m.match_id, 
              CASE 
                WHEN m.user_id_1 = $1 THEN u2.user_id
                ELSE u1.user_id
              END as partner_id,
              CASE 
                WHEN m.user_id_1 = $1 THEN u2.first_name
                ELSE u1.first_name
              END as partner_name
       FROM matches m
       JOIN users u1 ON m.user_id_1 = u1.user_id
       JOIN users u2 ON m.user_id_2 = u2.user_id
       WHERE (m.user_id_1 = $1 OR m.user_id_2 = $1) AND m.is_active = true`,
      [userId]
    );

    res.json({ success: true, matches: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Tambahkan method baru ini
exports.getMatchMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { userId } = req;

    // Verifikasi user adalah bagian dari match
    const matchCheck = await db.query(
      `SELECT 1 FROM matches 
       WHERE match_id = $1 AND (user_id_1 = $2 OR user_id_2 = $2)`,
      [matchId, userId]
    );

    if (matchCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const { rows } = await db.query(
      `SELECT * FROM messages 
       WHERE match_id = $1 
       ORDER BY sent_at ASC`,
      [matchId]
    );

    res.json({ success: true, messages: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};