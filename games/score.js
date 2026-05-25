async function loadUser() {
    const res = await fetch('/api/me', {
    credentials: 'include'
  });
  const data = await res.json();
  
  if(data.success === false){
    window.location.href = '/login';
    return null;
  }
  return data;
};

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

async function obtainedBadge(bid) {
  const user = await loadUser();
  try {
    const res = await fetch(`/api/obtainBadge/${user.uid}/${bid}`, {
      method: 'POST'
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};


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

async function generateFunFact(topic) {
    try {
        const response = await fetch('/funfact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'fun_fact',
                topic
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch fun fact');
        }

        return await response.json();

    } catch (error) {
        console.error('generateFunFact error:', error);

        return {
            title: 'Fun Fact',
            fact: 'Unable to load fun fact right now.'
        };
    }
}