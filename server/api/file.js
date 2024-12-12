export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const blob = toBlob(body.dataURL);
    if (!blob) {
      return { status: 'error', message: 'Invalid blob data' };
    }

    const formData = new FormData();
    formData.append('roomId', body.room);
    formData.append('text', body.message);
    formData.append('files', blob, body.filename);

    const response = await fetch('https://webexapis.com/v1/messages/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WEBEX_BOT_TOKEN}`
      },
      body: formData,
    });

    if (!response.ok) {
      // Handle HTTP errors
      const errorText = await response.text();
      console.error(`Error: ${response.status} - ${errorText}`);
      return { status: 'error', message: 'Failed to send file' };
    }

    return { status: 'success', message: 'File sent successfully' };
  } catch (error) {
    console.error('Error:', error);
    return { status: 'error', message: 'An error occurred during file sending' };
  }
});

function toBlob(dataURL) {
  const matches = dataURL.match(/^data:(.*?);base64,/);
  if (!matches) {
    console.error('Invalid data URL');
    return null;
  }

  const mimeType = matches[1];
  const base64Data = dataURL.replace(/^data:.*?;base64,/, '');
  const bin = atob(base64Data);
  const buffer = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }

  try {
    return new Blob([buffer.buffer], { type: mimeType });
  } catch (e) {
    console.error('Blob creation error:', e);
    return null;
  }
}