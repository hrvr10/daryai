// Single source of truth for the legal/contact pages. Edit here to update
// the address, phone, or email everywhere it appears on the site.

export const business = {
  brand: "daryai",
  domain: "daryai.in",
  supportEmail: "klystoglobal@gmail.com",
  supportPhoneDisplay: "+91 99909 57711",
  supportPhoneHref: "+919990957711",
  address: {
    line1: "G 52, Gali No. 2, Block E",
    line2: "Bhagwati Garden, Nawada",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110059",
    country: "India",
  },
} as const;

export const fullAddress = `${business.address.line1}, ${business.address.line2}, ${business.address.city}, ${business.address.state} ${business.address.pincode}, ${business.address.country}`;
