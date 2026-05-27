// Load user data from session
async function loadUser() {
  try {
    const res = await fetch('/api/me', {
      credentials: 'include'
    });
    
    // Check HTTP status code
    if (!res.ok) {
      if (res.status === 401) {
        console.warn('User not authenticated, redirecting to login');
        window.location.href = '/login';
        return null;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.success === false) {
      console.warn('User authentication failed, redirecting to login');
      window.location.href = '/login';
      return null;
    }
    
    return data;
    
  } catch (error) {
    console.error('loadUser error:', error);
    // Only redirect to login if it's an auth issue, not a network error
    if (error.message.includes('401')) {
      window.location.href = '/login';
    }
    return null;
  }
}

// Initialize user on page load
loadUser();

// Store score for the current user
async function storeScore(score, questId) {
  try {
    console.log("Storing score:", score);
    
    const res = await fetch('/api/me', {
      credentials: 'include'
    });
    
    // Check HTTP status code
    if (!res.ok) {
      if (res.status === 401) {
        console.warn('User not authenticated, redirecting to login');
        window.location.href = '/login';
        return;
      }
      throw new Error(`Failed to verify user: ${res.status}`);
    }
    
    const data = await res.json();

    if (data.success === false) {
      console.warn('User authentication failed, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    console.log(`Sending to server - User ID: ${data.uid}, Score: ${score}`);
    
    const storeRes = await fetch(`/api/storePoints/${data.uid}/${score}`, {
      method: 'POST',
      credentials: 'include'
    });
    
    const result = await storeRes.json();
    
    // Check HTTP status code
    if (!storeRes.ok) {
      if (storeRes.status === 400) {
        console.error('Invalid score value:', result.message);
      } else if (storeRes.status === 403) {
        console.error('Forbidden: Cannot update another user\'s points');
      } else if (storeRes.status === 404) {
        console.error('User not found');
      } else if (storeRes.status === 500) {
        console.error('Server error while storing score:', result.message);
      } else {
        console.error('Failed to store score:', result.message);
      }
      return;
    }
    
    console.log('Score stored successfully:', result);
    if (score >= 150 && questId !== null) {

      console.log(`Score reached ${score}, completing quest ${questId}`);

      const questRes = await fetch(
        `/api/questComplete/${data.uid}/${questId}`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      const questResult = await questRes.json();

      if (!questRes.ok) {
        console.error('Quest completion failed:', questResult.message);
        return;
      }

      console.log('Quest completed successfully:', questResult);
    }


  } catch (error) {
    console.error('storeScore error:', error);
  }
}

// Mark relic as obtained for the current user
async function obtainedRelic(rid) {
  try {
    const user = await loadUser();
    
    // Check if user data was successfully loaded
    if (!user || !user.uid) {
      console.error('Cannot obtain relic: user not logged in');
      return;
    }
    
    const res = await fetch(`/api/obtainRelic/${user.uid}/${rid}`, {
      method: 'POST',
      credentials: 'include'
    });
    
    // Check HTTP status code
    if (!res.ok) {
      if (res.status === 401) {
        console.error('Unauthorized: User not authenticated');
        window.location.href = '/login';
        return;
      } else if (res.status === 404) {
        console.error('Relic not found');
        return;
      } else if (res.status === 409) {
        console.log('Relic already obtained');
        return;
      } else if (res.status === 500) {
        console.error('Server error while obtaining relic');
        return;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.success) {
      console.log('Relic obtained successfully:', data);
    } else {
      console.warn('Failed to obtain relic:', data.message);
    }
    
  } catch (error) {
    console.error('obtainedRelic error:', error);
  }
}

// Generate a fun fact about a topic
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

    // Check HTTP status code
    if (!response.ok) {
      if (response.status === 400) {
        console.error('Invalid topic provided');
      } else if (response.status === 500) {
        console.error('Server error while generating fun fact');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result;
    } else {
      console.warn('Fun fact generation failed:', result);
      return {
        title: 'Fun Fact',
        fact: 'Unable to load fun fact right now.'
      };
    }

  } catch (error) {
    console.error('generateFunFact error:', error);

    return {
      title: 'Fun Fact',
      fact: 'Unable to load fun fact right now.'
    };
  }
}

async function bossRecord(questId) {
  try {
    const user = await loadUser();

    if (!user || !user.uid) {
      console.error('Cannot store quest: user not logged in');
      return;
    }

    const questRes = await fetch(
      `/api/questComplete/${user.uid}/${questId}`,
      {
        method: 'POST',
        credentials: 'include'
      }
    );

    const questResult = await questRes.json();

    if (!questRes.ok) {
      console.error('Quest completion failed:', questResult.message);
      return;
    }

    console.log('Quest completed successfully:', questResult);

    return questResult;

  } catch (error) {
    console.error('bossRecord error:', error);
    return null;
  }
}