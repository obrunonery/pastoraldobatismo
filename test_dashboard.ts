import { listBaptisms, listUniqueCities } from "./server/db.js";

async function test() {
    console.log("Testing listBaptisms...");
    try {
        const baptisms = await listBaptisms();
        console.log("Baptisms OK, count:", baptisms.length);
    } catch (e: any) {
        console.error("Baptisms Error:", e.stack);
    }

    console.log("Testing listUniqueCities...");
    try {
        const cities = await listUniqueCities();
        console.log("Cities OK, count:", cities.length);
    } catch (e: any) {
        console.error("Cities Error:", e.stack);
    }
}
test();
