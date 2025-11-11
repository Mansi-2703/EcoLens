import { suggestionRules } from "../utils/suggestionRules.js.js";

export const getSuggestions = async (req, res) => {
  try {
    const { data } = req.body;
    const suggestions = suggestionRules(data);
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: "AI suggestion failed" });
  }
};
