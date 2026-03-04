
import "dotenv/config";
import * as db from "./server/db";

async function main() {
    console.log("Testing db.createBaptism()...");
    const testData = {
        childName: "Criança Teste " + Date.now(),
        parentNames: "Pai Teste, Mãe Teste",
        godparentsNames: "Padrinho Teste, Madrinha Teste",
        status: "Solicitado",
        scheduledDate: new Date().toISOString().split('T')[0],
        gender: "m",
        age: 0,
        city: "Brasília"
    };

    try {
        const result = await db.createBaptism(testData);
        console.log("Create result:", JSON.stringify(result, null, 2));

        const list = await db.listBaptisms();
        const found = list.find(b => b.childName === testData.childName);
        if (found) {
            console.log("SUCCESS: Baptism created and found in list.");
        } else {
            console.log("FAILURE: Baptism created but NOT found in list?!");
        }
    } catch (e) {
        console.error("Create error:", e);
    }
}

main();
