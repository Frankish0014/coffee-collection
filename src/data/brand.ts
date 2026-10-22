export const brand = {
  name: "Coffee Collection",
  logo: { primary: "COFFEE", secondary: "COLLECTION" },
  /** Short mark used on product prints. */
  mark: "COFFEE CO.",
  status: "Coming soon",

  hero: {
    eyebrow: "Coffee-inspired lifestyle",
    title: ["More than coffee.", "A way of life."],
    body: "A collection of everyday essentials inspired by coffee culture, designed for those who appreciate simplicity, personal style, and the little things that make life meaningful.",
    cta: "Explore the Collection",
  },

  campaign: "Coffee culture, beyond the cup.",
  statement: "Simple by design. Inspired by coffee.",
  tagline: "Inspired by coffee. Designed for everyday life.",
  collectionHeading: "The Everyday Collection",
  discovery: "Find Your Everyday Essential",

  intro: {
    title: "Everyday essentials. Thoughtfully expressed.",
    body: "Our collection brings together minimalist apparel and lifestyle accessories, from T-shirts and hoodies to mugs, bottles, and tote bags. Each piece is an expression of our appreciation for coffee culture and the lifestyle that surrounds it.",
  },

  sections: {
    apparel: { eyebrow: "Apparel", title: "Made for Your Everyday" },
    accessories: { eyebrow: "Accessories & Drinkware", title: "The Details That Matter" },
  },

  story: {
    paragraphs: [
      "We believe coffee is more than a drink. It is a culture, a ritual, and a source of inspiration woven into everyday life.",
      "Inspired by this culture, we bring together apparel and lifestyle accessories that reflect a simple philosophy: good design doesn't need to be complicated.",
      "From everyday T-shirts and comfortable hoodies to mugs, bottles, and practical accessories, our collection is designed around a love for simplicity, self-expression, and thoughtful design.",
      "We are building a brand for people who appreciate the details, value their individuality, and carry their interests into the way they live.",
    ],
    closing: "Coffee culture. Everyday expression. Timeless simplicity.",
  },

  materials: {
    heading: "Materials & Quality",
    title: "Thoughtful Design. Everyday Function.",
    body: [
      "We believe good products begin with thoughtful choices. Our collection is guided by comfort, functionality, visual simplicity, and designs that fit naturally into everyday life.",
      "As we develop our range, we are carefully evaluating materials, finishes, and product construction to find the right balance between appearance, comfort, and practical use.",
    ],
    criteria: [
      { title: "Comfort", body: "Materials suited to the intended use of each product." },
      { title: "Design", body: "Clean finishes and details that complement the overall aesthetic." },
      { title: "Functionality", body: "Products designed to serve a practical purpose in everyday life." },
      { title: "Versatility", body: "Colours, shapes, and styles that work across different settings." },
      { title: "Value", body: "A considered balance between product quality, design, and price." },
    ],
    note: "Specific material compositions, care instructions, and product features will be provided on individual product pages once confirmed.",
  },

  launch:
    "This piece is part of our upcoming launch. Reserve it now and we'll reach out on WhatsApp or email with pricing, availability, and delivery details as soon as the collection goes live.",

  newsletter: {
    title: "A Little More of What You Love",
    body: "Discover new releases, collection updates, and inspiration from coffee culture.",
  },

  contact: {
    email: "ishimwefrank0014@gmail.com",
    phone: "+250782658368",
    phoneDisplay: "+250 782 658 368",
  },
} as const;

export const whatsappLink = (text: string) =>
  `https://wa.me/${brand.contact.phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export const mailtoLink = (subject: string, body = "") =>
  `mailto:${brand.contact.email}?subject=${encodeURIComponent(subject)}${
    body ? `&body=${encodeURIComponent(body)}` : ""
  }`;

export const telLink = `tel:${brand.contact.phone}`;

export const launchListMessage = `Hi! I'd love to join the ${brand.name} launch list. Please let me know when the collection drops.`;
