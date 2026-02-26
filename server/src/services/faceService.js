const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

export async function detectFacesFromUrl(imageUrl) {
  let retries = 3;
  let lastError;
  
  while(retries > 0) {
    try {
      const formData = new FormData();
      formData.append('url', imageUrl);
      
      // Using built-in fetch with abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
      
      const response = await fetch(`${PYTHON_SERVICE_URL}/generate-embeddings`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Python service error (${response.status}): ${errText}`);
      }
      
      const result = await response.json();
      return result.faces || [];
    } catch (e) {
      lastError = e;
      retries--;
      if (retries > 0) await new Promise(r => setTimeout(r, 2000)); // exponential or fixed backoff
    }
  }
  
  throw lastError;
}
