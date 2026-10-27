import type { AdminOrder, AdminProduct, AdminCustomer } from "./admin-data";

/**
 * Checks whether a given ISO/date string falls within the selected date range.
 */
export function isDateInRange(
  dateStr: string,
  range: string,
  customStart?: string,
  customEnd?: string,
): boolean {
  if (!dateStr) return true;
  const d = new Date(dateStr).getTime();
  if (isNaN(d)) return true;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  if (range === "Today") {
    return d >= todayStart;
  }
  if (range === "Last 7 days") {
    const sevenDaysAgo = todayStart - 6 * 24 * 60 * 60 * 1000;
    return d >= sevenDaysAgo;
  }
  if (range === "Last 30 days") {
    const thirtyDaysAgo = todayStart - 29 * 24 * 60 * 60 * 1000;
    return d >= thirtyDaysAgo;
  }
  if (range === "This Year") {
    const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
    return d >= yearStart;
  }
  if (range === "Custom range") {
    if (customStart) {
      const s = new Date(customStart).getTime();
      if (!isNaN(s) && d < s) return false;
    }
    if (customEnd) {
      const e = new Date(customEnd);
      e.setHours(23, 59, 59, 999);
      if (!isNaN(e.getTime()) && d > e.getTime()) return false;
    }
    return true;
  }
  return true;
}

/**
 * Format date for display in tables and reports
 */
export function formatReportDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Escape a single cell for standard RFC-4180 CSV
 */
function escapeCSVCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates an RFC-4180 CSV string with UTF-8 BOM
 */
export function generateCSV(headers: string[], rows: (string | number)[][]): string {
  const headerLine = headers.map(escapeCSVCell).join(",");
  const rowLines = rows.map((r) => r.map(escapeCSVCell).join(","));
  return "\uFEFF" + [headerLine, ...rowLines].join("\r\n");
}

/**
 * Generates an XML Spreadsheet 2003 string (Native Excel .xls format)
 * Opens cleanly in Microsoft Excel with formatted headers, styles, and data types.
 */
export function generateExcelXML(
  headers: string[],
  rows: (string | number)[][],
  sheetName = "Report",
): string {
  const sanitize = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const headerCells = headers
    .map(
      (h) => `
        <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${sanitize(h)}</Data></Cell>`,
    )
    .join("");

  const dataRows = rows
    .map((row) => {
      const cells = row
        .map((val) => {
          const isNum = typeof val === "number" && !isNaN(val);
          const type = isNum ? "Number" : "String";
          const style = isNum ? ' ss:StyleID="NumberStyle"' : "";
          return `<Cell${style}><Data ss:Type="${type}">${sanitize(val)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D4D4D8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#F4F4F2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="NumberStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sanitize(sheetName)}">
  <Table>
   <Row ss:Height="24">
    ${headerCells}
   </Row>
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

/**
 * Triggers a download of file content in the browser
 */
export function triggerFileDownload(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export type ReportFilterParams = {
  type: string;
  range: string;
  customStart?: string;
  customEnd?: string;
  prod?: string;
  cat?: string;
  orders: AdminOrder[];
  products: AdminProduct[];
  customers: AdminCustomer[];
};

export type GeneratedReportResult = {
  title: string;
  fileNameBase: string;
  headers: string[];
  rows: (string | number)[][];
  totalRecords: number;
};

/**
 * Compiles report headers, rows, and filename based on active filters and datasets.
 */
export function buildReportData(params: ReportFilterParams): GeneratedReportResult {
  const {
    type,
    range,
    customStart,
    customEnd,
    prod = "all",
    cat = "all",
    orders,
    products,
    customers,
  } = params;

  const dateSlug = new Date().toISOString().slice(0, 10);

  // 1. Sales records
  if (type === "Sales records") {
    const filteredOrders = orders.filter((o) => {
      if (!isDateInRange(o.date, range, customStart, customEnd)) return false;
      if (prod !== "all") {
        const matchesProd = o.items.some(
          (item) => item.name.toLowerCase().includes(prod.toLowerCase()) || prod.includes(item.name.toLowerCase()),
        );
        if (!matchesProd) return false;
      }
      if (cat !== "all") {
        const matchesCat = o.items.some((item) => {
          const pMatch = products.find(
            (p) =>
              p.name.toLowerCase() === item.name.toLowerCase() ||
              p.slug.toLowerCase().includes(item.name.toLowerCase()) ||
              item.name.toLowerCase().includes(p.name.toLowerCase()),
          );
          return pMatch ? pMatch.category?.toLowerCase() === cat.toLowerCase() : false;
        });
        if (!matchesCat) return false;
      }
      return true;
    });

    const headers = [
      "Order ID",
      "Tracking ID",
      "Order Date",
      "Customer Name",
      "Customer Email",
      "Phone Number",
      "Delivery Method",
      "Delivery Address",
      "Payment Status",
      "Fulfillment Status",
      "Items Summary",
      "Selling Price without Discount (NGN)",
      "Discount Applied (NGN)",
      "Subtotal (NGN)",
      "Shipping Fee (NGN)",
      "Total Amount (NGN)",
      "Waybill Number",
    ];

    const rows = filteredOrders.map((o) => {
      let orderOriginalSellingPrice = 0;
      for (const item of o.items) {
        const prodMatch = products.find(
          (p) =>
            p.name.toLowerCase() === item.name.toLowerCase() ||
            p.slug.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(p.name.toLowerCase()),
        );
        const unitOriginalPrice =
          prodMatch?.compareAt && prodMatch.compareAt > (item.price || prodMatch.price)
            ? prodMatch.compareAt
            : item.price || prodMatch?.price || 0;
        orderOriginalSellingPrice += unitOriginalPrice * (item.qty || 1);
      }
      if (orderOriginalSellingPrice < (o.subtotal || 0)) {
        orderOriginalSellingPrice = o.subtotal || 0;
      }
      const discountAmount = Math.max(0, orderOriginalSellingPrice - (o.subtotal || 0));

      return [
        o.id,
        o.trackingId || "N/A",
        formatReportDate(o.date),
        o.customer,
        o.email,
        o.phone || "N/A",
        o.deliveryMethod || "Courier",
        o.address || "N/A",
        o.paymentStatus || "Paid",
        o.status || "Paid",
        o.items.map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.qty}`).join("; "),
        orderOriginalSellingPrice,
        discountAmount,
        o.subtotal || 0,
        o.shippingFee || 0,
        o.total || 0,
        o.waybillNumber || "N/A",
      ];
    });

    return {
      title: "Sales Records",
      fileNameBase: `EIMAH-Sales-Records-${dateSlug}`,
      headers,
      rows,
      totalRecords: rows.length,
    };
  }

  // 2. Product sales history
  if (type === "Product sales history") {
    let filteredProducts = [...products];
    if (prod !== "all") {
      filteredProducts = filteredProducts.filter((p) => p.slug === prod);
    }
    if (cat !== "all") {
      filteredProducts = filteredProducts.filter(
        (p) => p.category?.toLowerCase() === cat.toLowerCase(),
      );
    }

    const ordersInRange = orders.filter((o) => isDateInRange(o.date, range, customStart, customEnd));

    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "Stock Status",
      "Current Stock",
      "Selling Price without Discount (NGN)",
      "Discount Amount (NGN)",
      "Discounted Unit Price (NGN)",
      "Cost Price (NGN)",
      "Units Sold",
      "Total Value without Discount (NGN)",
      "Gross Revenue (NGN)",
      "Estimated Profit (NGN)",
      "Margin (%)",
    ];

    const rows = filteredProducts.map((p) => {
      let soldCount = 0;
      let revenue = 0;

      for (const o of ordersInRange) {
        for (const item of o.items) {
          if (
            item.name.toLowerCase() === p.name.toLowerCase() ||
            p.slug.toLowerCase().includes(item.name.toLowerCase())
          ) {
            soldCount += item.qty || 1;
            revenue += (item.price || p.price) * (item.qty || 1);
          }
        }
      }

      // If no matching items in filtered orders, fallback to p.sold for annual/wide ranges
      if (soldCount === 0 && (range === "This Year" || range === "Last 30 days")) {
        soldCount = p.sold || 0;
        revenue = soldCount * p.price;
      }

      const sellingPriceWithoutDiscount =
        p.compareAt && p.compareAt > p.price ? p.compareAt : p.price;
      const discountPerUnit =
        p.compareAt && p.compareAt > p.price ? p.compareAt - p.price : 0;
      const discountedUnitPrice = p.price;
      const totalValueWithoutDiscount = sellingPriceWithoutDiscount * soldCount;

      const cost = p.costPrice || Math.round(p.price * 0.58);
      const profit = revenue - cost * soldCount;
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) + "%" : "0%";

      return [
        p.sku || `EMH-${p.id.slice(0, 6)}`,
        p.name,
        p.category,
        p.status || "Active",
        p.stock ?? 0,
        sellingPriceWithoutDiscount,
        discountPerUnit,
        discountedUnitPrice,
        cost,
        soldCount,
        totalValueWithoutDiscount,
        revenue,
        profit,
        margin,
      ];
    });

    return {
      title: "Product Sales History",
      fileNameBase: `EIMAH-Product-Sales-${dateSlug}`,
      headers,
      rows,
      totalRecords: rows.length,
    };
  }

  // 3. Revenue report
  if (type === "Revenue report") {
    const filteredOrders = orders.filter((o) => isDateInRange(o.date, range, customStart, customEnd));

    // Group orders by date (YYYY-MM-DD)
    const groupedByDate: Record<
      string,
      {
        count: number;
        itemsCount: number;
        sellingPriceWithoutDiscount: number;
        discountTotal: number;
        subtotal: number;
        shipping: number;
        total: number;
      }
    > = {};

    for (const o of filteredOrders) {
      const day = o.date ? o.date.slice(0, 10) : dateSlug;
      if (!groupedByDate[day]) {
        groupedByDate[day] = {
          count: 0,
          itemsCount: 0,
          sellingPriceWithoutDiscount: 0,
          discountTotal: 0,
          subtotal: 0,
          shipping: 0,
          total: 0,
        };
      }

      let orderOriginalSellingPrice = 0;
      for (const item of o.items) {
        const prodMatch = products.find(
          (p) =>
            p.name.toLowerCase() === item.name.toLowerCase() ||
            p.slug.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(p.name.toLowerCase()),
        );
        const unitOriginalPrice =
          prodMatch?.compareAt && prodMatch.compareAt > (item.price || prodMatch.price)
            ? prodMatch.compareAt
            : item.price || prodMatch?.price || 0;
        orderOriginalSellingPrice += unitOriginalPrice * (item.qty || 1);
      }
      if (orderOriginalSellingPrice < (o.subtotal || 0)) {
        orderOriginalSellingPrice = o.subtotal || 0;
      }
      const discount = Math.max(0, orderOriginalSellingPrice - (o.subtotal || 0));

      groupedByDate[day].count += 1;
      groupedByDate[day].itemsCount += o.items.reduce((sum, item) => sum + (item.qty || 1), 0);
      groupedByDate[day].sellingPriceWithoutDiscount += orderOriginalSellingPrice;
      groupedByDate[day].discountTotal += discount;
      groupedByDate[day].subtotal += o.subtotal || 0;
      groupedByDate[day].shipping += o.shippingFee || 0;
      groupedByDate[day].total += o.total || 0;
    }

    const headers = [
      "Date",
      "Total Orders",
      "Items Sold",
      "Selling Price without Discount (NGN)",
      "Total Discounts (NGN)",
      "Gross Sales (NGN)",
      "Shipping Revenue (NGN)",
      "Net Total Revenue (NGN)",
      "Average Order Value (NGN)",
    ];

    const sortedDays = Object.keys(groupedByDate).sort().reverse();
    const rows = sortedDays.map((day) => {
      const data = groupedByDate[day];
      const aov = data.count > 0 ? Math.round(data.total / data.count) : 0;
      return [
        formatReportDate(day),
        data.count,
        data.itemsCount,
        data.sellingPriceWithoutDiscount,
        data.discountTotal,
        data.subtotal,
        data.shipping,
        data.total,
        aov,
      ];
    });

    return {
      title: "Revenue Report",
      fileNameBase: `EIMAH-Revenue-Report-${dateSlug}`,
      headers,
      rows,
      totalRecords: rows.length,
    };
  }

  // 4. Profit report
  if (type === "Profit report") {
    const filteredOrders = orders.filter((o) => isDateInRange(o.date, range, customStart, customEnd));

    const headers = [
      "Order ID",
      "Order Date",
      "Customer",
      "Items Count",
      "Selling Price without Discount (NGN)",
      "Discount (NGN)",
      "Order Revenue (NGN)",
      "Estimated Cost (NGN)",
      "Gross Profit (NGN)",
      "Profit Margin (%)",
      "Status",
    ];

    const rows = filteredOrders.map((o) => {
      const itemsCount = o.items.reduce((s, i) => s + (i.qty || 1), 0);
      let orderCost = 0;
      let orderOriginalSellingPrice = 0;

      for (const item of o.items) {
        const prodMatch = products.find((p) => p.name.toLowerCase() === item.name.toLowerCase());
        const unitCost = prodMatch?.costPrice || Math.round((item.price || 0) * 0.58);
        orderCost += unitCost * (item.qty || 1);

        const unitOriginalPrice =
          prodMatch?.compareAt && prodMatch.compareAt > (item.price || prodMatch.price)
            ? prodMatch.compareAt
            : item.price || prodMatch?.price || 0;
        orderOriginalSellingPrice += unitOriginalPrice * (item.qty || 1);
      }

      if (orderOriginalSellingPrice < (o.subtotal || 0)) {
        orderOriginalSellingPrice = o.subtotal || 0;
      }
      const orderDiscount = Math.max(0, orderOriginalSellingPrice - (o.subtotal || 0));

      // If order items were 0 or missing
      if (orderCost === 0 && o.subtotal > 0) {
        orderCost = Math.round(o.subtotal * 0.58);
      }

      const grossProfit = Math.max(0, (o.subtotal || 0) - orderCost);
      const margin = o.subtotal > 0 ? ((grossProfit / o.subtotal) * 100).toFixed(1) + "%" : "0%";

      return [
        o.id,
        formatReportDate(o.date),
        o.customer,
        itemsCount,
        orderOriginalSellingPrice,
        orderDiscount,
        o.subtotal || o.total || 0,
        orderCost,
        grossProfit,
        margin,
        o.status || "Paid",
      ];
    });

    return {
      title: "Profit Report",
      fileNameBase: `EIMAH-Profit-Report-${dateSlug}`,
      headers,
      rows,
      totalRecords: rows.length,
    };
  }

  // 5. Customer purchases
  // (type === "Customer purchases" or fallback)
  const headers = [
    "Customer ID",
    "Customer Name",
    "Email",
    "Phone Number",
    "City",
    "State",
    "Status",
    "Total Orders",
    "Total Spent (NGN)",
    "Average Spend / Order (NGN)",
    "Date Joined",
    "Last Order Date",
  ];

  const filteredCustomers = customers.filter((c) => {
    // If range is specific, check lastOrder or dateJoined
    if (range !== "This Year" && range !== "Last 30 days") {
      return isDateInRange(c.lastOrder || c.dateJoined, range, customStart, customEnd);
    }
    return true;
  });

  const rows = (filteredCustomers.length > 0 ? filteredCustomers : customers).map((c) => {
    const aov = c.orders > 0 ? Math.round(c.spent / c.orders) : 0;
    return [
      c.id,
      c.name,
      c.email,
      c.phone || "N/A",
      c.city || "Lagos",
      c.state || "Lagos",
      c.status || "Active",
      c.orders || 0,
      c.spent || 0,
      aov,
      formatReportDate(c.dateJoined),
      formatReportDate(c.lastOrder),
    ];
  });

  return {
    title: "Customer Purchases",
    fileNameBase: `EIMAH-Customer-Purchases-${dateSlug}`,
    headers,
    rows,
    totalRecords: rows.length,
  };
}

/**
 * Downloads a report file according to specified format
 */
export function exportAndDownloadReport(
  reportData: GeneratedReportResult,
  format: "CSV" | "Excel",
): void {
  const { fileNameBase, headers, rows, title } = reportData;

  if (format === "CSV") {
    const csvContent = generateCSV(headers, rows);
    triggerFileDownload(csvContent, `${fileNameBase}.csv`, "text/csv;charset=utf-8;");
  } else {
    const excelXML = generateExcelXML(headers, rows, title);
    triggerFileDownload(excelXML, `${fileNameBase}.xls`, "application/vnd.ms-excel;charset=utf-8;");
  }
}
