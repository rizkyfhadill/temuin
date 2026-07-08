const BASE_URL =
  "https://www.emsifa.com/api-wilayah-indonesia/api";

export interface Province {
  id: string;
  name: string;
}

export interface Regency {
  id: string;
  province_id: string;
  name: string;
}

export interface District {
  id: string;
  regency_id: string;
  name: string;
}

export interface Village {
  id: string;
  district_id: string;
  name: string;
}

export async function getProvinces(): Promise<Province[]> {
  const res = await fetch(`${BASE_URL}/provinces.json`, {
    cache: "force-cache",
  });

  return res.json();
}

export async function getRegencies(
  provinceId: string
): Promise<Regency[]> {
  const res = await fetch(
    `${BASE_URL}/regencies/${provinceId}.json`
  );

  return res.json();
}

export async function getDistricts(
  regencyId: string
): Promise<District[]> {
  const res = await fetch(
    `${BASE_URL}/districts/${regencyId}.json`
  );

  return res.json();
}

export async function getVillages(
  districtId: string
): Promise<Village[]> {
  const res = await fetch(
    `${BASE_URL}/villages/${districtId}.json`
  );

  return res.json();
}