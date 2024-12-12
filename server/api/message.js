export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const response = await fetch('https://webexapis.com/v1/messages/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBEX_BOT_TOKEN}`
      },
      body: JSON.stringify({ roomId: body.room, text: body.message }),
    });

    if (!response.ok) {
      // Handle HTTP errors
      const errorText = await response.text();
      console.error(`Error: ${response.status} - ${errorText}`);
      return { status: 'error', message: 'Failed to send message' };
    }

    return { status: 'success', message: 'Message sent successfully' };
  } catch (error) {
    console.error('Fetch error:', error);
    return { status: 'error', message: 'An error occurred during message sending' };
  }
});