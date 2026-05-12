async function loadUser() {
    const res = await fetch('/api/me', {
    credentials: 'include'
  });
  const data = await res.json();
  if(data.success === false){
    window.location.href = '/login';
    return;
  }
};
loadUser();

async function storeScore(score) {
    console.log("ran storing")
  const res = await fetch('/api/me', {
    credentials: 'include'
  });
  const data = await res.json();

  if(data.success === false){
    window.location.href = '/login';
    return;
  }
  
  console.log(`sending to server id: ${data.uid} ${score}`);
  // Fixed: Added await, fetch, and proper error handling
  const storeRes = await fetch(`/api/storePoints/${data.uid}/${score}`, {
    method: 'POST',
    credentials: 'include'
  });
  const result = await storeRes.json();
  console.log(result);
  if (!storeRes.ok) {
    console.error('Failed to store score:', result.error);
    return;
  }
  
  console.log('Score stored successfully:', result);
}