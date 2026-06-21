const url = "https://corehex-rent-production.up.railway.app/api/equipment";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMzZlMzg3N2I1YTM2NWIzYWJiNTAzYSIsImlhdCI6MTc4MTk4MjA5NiwiZXhwIjoxNzgyNTg2ODk2fQ.KwTEjnnLWy7SUzIHXRPHNYLjVp0DnIbUr64vLSLgi6E"

const data = {
  name: "Test Equipment",
  category: "Generator",
  quantity: 5,
};

async function testPost() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers));

    const text = await response.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Error:", error);
  }
}

testPost();