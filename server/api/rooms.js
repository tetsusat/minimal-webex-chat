export default defineEventHandler(async (event) => {
  try {
    const response = await fetch('https://webexapis.com/v1/rooms/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBEX_BOT_TOKEN}`
      },
    });

    if (!response.ok) {
      // Handle HTTP errors
      const errorText = await response.text();
      console.error(`Error: ${response.status} - ${errorText}`);
      return { status: 'error', message: 'Failed to retrieve rooms' };
    }

    const data = await response.json();
    return { status: 'success', items: data.items };
  } catch (error) {
    console.error('Fetch error:', error);
    return { status: 'error', message: 'An error occurred while retrieving rooms' };
  }
});