import { supabase } from "@boot/modules/supabase.js";
import { URLS } from "@constants/URLS.js";

export function lookupService() {
  async function getMaritalStatuses() {
    const { data, error } = await supabase
      .from(URLS.TABLE_MARITAL_STATUSES)
      .select("id, name")
      .order("id");

    if (error) throw error;
    return data;
  }

  async function getEmploymentTypes() {
    const { data, error } = await supabase
      .from(URLS.TABLE_EMPLOYMENT_TYPES)
      .select("id, name")
      .order("id");

    if (error) throw error;
    return data;
  }

  return { getMaritalStatuses, getEmploymentTypes };
}
