import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const test = async () => {
  const vendorToken = jwt.sign({ id: "6a491167c2b82a9b3b0d8c53", isAdmin: true }, process.env.JWT_SECRET);
  const superToken = jwt.sign({ id: "6a491ecb4a1128bebc63504b", isAdmin: true }, process.env.JWT_SECRET);

  try {
    const vRes = await axios.get("http://localhost:4000/api/order/stats", {
      headers: { token: vendorToken }
    });
    console.log("Vendor Stats Response dailyRevenue length:", vRes.data.data?.dailyRevenue?.length);
    console.log("Vendor Stats trends:", vRes.data.data?.trends);

    const sRes = await axios.get("http://localhost:4000/api/admin/platform-stats", {
      headers: { token: superToken }
    });
    console.log("Superadmin Stats Response dailyRevenue length:", sRes.data.data?.dailyRevenue?.length);
    console.log("Superadmin Stats trends:", sRes.data.data?.trends);
  } catch (err) {
    if (err.response) {
      console.log("Error Status:", err.response.status);
      console.log("Error Data:", err.response.data);
    } else {
      console.error(err.message);
    }
  }
};

test();
