export function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
}

export function formatDate(tanggal) {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(tanggal));
}

export function monthNumber(month) {
  const date = new Date(2000, month - 1, 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(date);
}
