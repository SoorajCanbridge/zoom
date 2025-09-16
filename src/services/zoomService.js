// services/zoomService.js
const axios = require("axios");

class ZoomService {
  constructor() {
    this.clientId = process.env.ZOOM_CLIENT_ID;
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
    this.accountId = process.env.ZOOM_ACCOUNT_ID;
    this.baseUrl = "https://api.zoom.us/v2";
  }

  async getAccessToken() {
    try {
      const response = await axios.post(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`,
        {},
        {
          auth: {
            username: this.clientId,
            password: this.clientSecret,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      throw new Error(
        `Zoom token generation failed: ${error.response?.data?.reason || error.message}`
      );
    }
  }

  async createMeeting({ topic, start_time, duration }) {
    const token = await this.getAccessToken();
    const meetingConfig = {
      topic,
      type: 2, // Scheduled
      start_time,
      duration,
      timezone: "UTC",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
      },
    };

    const response = await axios.post(`${this.baseUrl}/users/me/meetings`, meetingConfig, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  }

  async updateMeeting(meetingId, { topic, start_time, duration }) {
    const token = await this.getAccessToken();
    await axios.patch(
      `${this.baseUrl}/meetings/${meetingId}`,
      { topic, start_time, duration },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true };
  }

  async deleteMeeting(meetingId) {
    const token = await this.getAccessToken();
    await axios.delete(`${this.baseUrl}/meetings/${meetingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true };
  }

  async getMeetingDetails(meetingId) {
    const token = await this.getAccessToken();
    const response = await axios.get(`${this.baseUrl}/meetings/${meetingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}

module.exports = new ZoomService();
