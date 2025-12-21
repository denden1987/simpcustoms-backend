import express from 'express';
import { supabase } from '../utils/supabaseClient.js';

const router = express.Router();

router.get('/test-db', async (req, res) => {
  try {
    // Insert test row
    const { error: insertError } = await supabase
      .from('test_connection')
      .insert([{ message: 'Hello from Supabase!' }]);

    if (insertError) throw insertError;

    // Read rows back
    const { data, error: selectError } = await supabase
      .from('test_connection')
      .select('*')
      .order('created_at', { ascending: false });

    if (selectError) throw selectError;

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
