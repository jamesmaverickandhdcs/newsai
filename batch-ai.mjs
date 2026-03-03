const ids = [
  "ed8f6e51-1462-4e30-897a-8b35e3d21a5e",
  "baa390d0-521b-4353-99ff-6ba14a1002b2",
  "d31396b3-9adc-4e49-acd4-5666919c972f",
  "d92e9b79-9b4f-4396-9099-b9cc01c7cadb",
  "e68fcc86-dae1-4f66-9af0-964715cd1183",
  "cad09c4d-dfb8-40b1-9d3d-37308e7836a6",
  "101add7c-ac47-4dc8-ad16-87743af02d7f",
  "01e8054e-9398-4cdc-84be-0a55c5a2ec7f",
  "e7c0cf89-8800-49b0-ab0d-ae3d24db4cb7",
  "f0bb2495-7ee0-47c3-aa02-b9fe649b6f34",
  "01f33da4-f2cc-465a-b580-cc6587d687f3",
  "c0adb617-161f-4dc7-b87f-efeb1aa1b734",
  "ef152f2f-ccfe-4082-8c07-129bbdef0016",
  "9f035dfb-c5d7-4b88-b20c-b2e90ac10a1b",
  "c465e53f-eb43-4e0d-acc5-59fc8467d26a",
  "32f5c1b1-42a3-40d4-93b9-fa287baaf186",
  "b536913a-55bc-4147-979b-05e2e6d502e4",
  "5fd178ac-9867-4e51-ae07-4e2f7f110373",
  "ea71e96a-b9e6-47aa-bde6-8a04dc27b1b2",
  "0e082eae-9fc5-4c8e-87e6-859c38f191fe",
  "efd3b75f-c8a4-4604-83be-00cf8e4d48f9",
  "ef3b1307-1f73-4eb4-94fb-28f06dd08745",
  "91aebe8e-1b95-42fb-82a4-38c2d993f541"
];

async function processArticle(id) {
  try {
    const res = await fetch("http://localhost:3000/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: id }),
    });
    const data = await res.json();
    if (data.success) {
      console.log(`✅ Done: ${id}`);
    } else {
      console.log(`❌ Failed: ${id}`, data);
    }
  } catch (e) {
    console.log(`❌ Error: ${id}`, e.message);
  }
}

async function runAll() {
  console.log(`🚀 Processing ${ids.length} articles...`);
  for (const id of ids) {
    console.log(`⏳ Processing: ${id}`);
    await processArticle(id);
    // Wait 2 seconds between each to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("🎉 All done!");
}

runAll();
