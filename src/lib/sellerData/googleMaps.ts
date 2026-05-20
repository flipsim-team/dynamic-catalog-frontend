// Extract Google Maps cid/data_id hints from a URL or raw identifier string.
function extractGoogleMapsReference(input: string): {
  cid: string;
  dataId: string;
  hasGoogleMapsUrl: boolean;
} {
  const value = String(input || "").trim();
  if (!value) return { cid: "", dataId: "", hasGoogleMapsUrl: false };

  const cidMatch = value.match(/[?&]cid=(\d+)/i) || value.match(/cid:(\d+)/i);
  const dataIdMatch = value.match(/[?&]data_id=([^&]+)/i);

  return {
    cid: cidMatch?.[1] || "",
    dataId: dataIdMatch?.[1] ? decodeURIComponent(dataIdMatch[1]) : "",
    hasGoogleMapsUrl: /google\.com\/maps/i.test(value),
  };
}

// Resolve the best Google Maps URL/embed pair from the available location fields.
export function buildGoogleMapsUrls(input: {
  googleLocation: string;
  gmbLudocid: string;
  reviewsUrl: string;
  fullAddress: string;
  city: string;
  sellerName: string;
}): { mapUrl: string; embedUrl: string; source: string } {
  const directUrl = String(input.googleLocation || "").trim();
  if (directUrl) {
    const directReference = extractGoogleMapsReference(directUrl);
    if (directUrl.includes("output=embed")) {
      return {
        mapUrl: directUrl,
        embedUrl: directUrl,
        source: "google_location",
      };
    }
    if (directReference.cid) {
      const mapUrl = `https://www.google.com/maps?cid=${directReference.cid}`;
      return {
        mapUrl,
        embedUrl: `${mapUrl}&output=embed`,
        source: "google_location",
      };
    }
    if (directReference.hasGoogleMapsUrl) {
      const separator = directUrl.includes("?") ? "&" : "?";
      return {
        mapUrl: directUrl,
        embedUrl: `${directUrl}${separator}output=embed`,
        source: "google_location",
      };
    }
    return {
      mapUrl: directUrl,
      embedUrl: directUrl,
      source: "google_location",
    };
  }

  const gmbReference = extractGoogleMapsReference(input.gmbLudocid);
  if (gmbReference.cid) {
    const mapUrl = `https://www.google.com/maps?cid=${gmbReference.cid}`;
    return {
      mapUrl,
      embedUrl: `${mapUrl}&output=embed`,
      source: "gmb_ludocid",
    };
  }

  const reviewReference = extractGoogleMapsReference(input.reviewsUrl);
  if (reviewReference.cid) {
    const mapUrl = `https://www.google.com/maps?cid=${reviewReference.cid}`;
    return {
      mapUrl,
      embedUrl: `${mapUrl}&output=embed`,
      source: "reviews_url",
    };
  }

  if (reviewReference.dataId) {
    const query = [input.fullAddress, input.city, reviewReference.dataId]
      .filter(Boolean)
      .join(" ");
    const resolvedQuery = query || reviewReference.dataId;
    return {
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resolvedQuery)}`,
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(resolvedQuery)}&output=embed`,
      source: "reviews_url",
    };
  }

  const query = [input.fullAddress, input.city].filter(Boolean).join(", ");
  if (query) {
    return {
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
      source: "address",
    };
  }

  if (input.sellerName) {
    return {
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input.sellerName)}`,
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(input.sellerName)}&output=embed`,
      source: "seller_name",
    };
  }

  return { mapUrl: "", embedUrl: "", source: "" };
}
