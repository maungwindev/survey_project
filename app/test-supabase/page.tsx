"use client";

import { useEffect } from "react";
import { createClient } from "../../lib/supabase/client"; // adjust path

export default function TestSupabasePage() {
  useEffect(() => {
    const checkConnection = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("participants").select("*").limit(1);

      if (error) {
        console.error("Supabase connection failed:", error);
      } else {
        console.log("Supabase connected successfully:", data);
      }
    };

    checkConnection();
  }, []);

  return <div>Open the browser console to see Supabase connection result</div>;
}
