/**
 * Tax Invoice - 9 columns (SL, Product, GST %, Qty, Rate, Amount, CGST, SGST, Total) + below part subtotal
 */

function formatNum(amount) {
  return Number(amount || 0).toFixed(2);
}

function fillInvoice(data) {
  document.getElementById('invoiceNumber').textContent = data.invoiceNumber || '—';
  document.getElementById('invoiceDate').textContent = data.date || '—';
  document.getElementById('customerName').textContent = data.customerName || '—';
  document.getElementById('customerAddress').textContent = data.customerAddress || '—';

  var tbody = document.getElementById('itemsBody');
  tbody.innerHTML = '';
  var gstPct = data.gstPercent != null ? data.gstPercent : 18;
  var sumAmount = 0, sumCGST = 0, sumSGST = 0, sumTotal = 0;

  (data.items || []).forEach(function (item, i) {
    var rate = Number(item.rate) || 0;
    var qty = Number(item.qty) || 0;
    var amount = rate * qty;
    var cgst = amount * (gstPct / 200);
    var sgst = amount * (gstPct / 200);
    var total = amount + cgst + sgst;
    sumAmount += amount;
    sumCGST += cgst;
    sumSGST += sgst;
    sumTotal += total;

    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td class="col-sl">' + (i + 1) + '</td>' +
      '<td class="col-product">' + (item.name || 'Product').substring(0, 60) + '</td>' +
      '<td class="col-gst">' + formatNum(gstPct) + '</td>' +
      '<td class="col-qty">' + qty + '</td>' +
      '<td class="col-rate">' + formatNum(rate) + '</td>' +
      '<td class="col-amount">' + formatNum(amount) + '</td>' +
      '<td class="col-cgst">' + formatNum(cgst) + '</td>' +
      '<td class="col-sgst">' + formatNum(sgst) + '</td>' +
      '<td class="col-total">' + formatNum(total) + '</td>';
    tbody.appendChild(tr);
  });

  var delivery = Number(data.delivery) || 0;
  var grandTotal = sumTotal + delivery;

  document.getElementById('subTotal').textContent = formatNum(sumAmount);
  document.getElementById('cgstTotal').textContent = formatNum(sumCGST);
  document.getElementById('sgstTotal').textContent = formatNum(sumSGST);
  document.getElementById('delivery').textContent = formatNum(delivery);
  document.getElementById('grandTotal').textContent = formatNum(grandTotal);
}

function fillSample() {
  fillInvoice({
    invoiceNumber: 'INV-006',
    date: '25-10-2025',
    customerName: 'Abhay Pratap Singh',
    customerAddress: 'IIIT Bhubaneswar, Bhubaneswar, Odisha, India - 751003',
    gstPercent: 18,
    delivery: 0,
    items: [
      { name: 'Flex Sensor 2.2" Bend Sensor for Hand Gesture Recognition Good Quality', rate: 254.24, qty: 3 },
      { name: 'ADXL345 Triple Axis Accelerometer Board', rate: 216.10, qty: 1 },
      { name: 'Resistor Kit 500 pcs', rate: 88.14, qty: 4 },
      { name: 'Arduino Nano V3.0 Development Board - Clone', rate: 350.00, qty: 2 },
    ],
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fillSample);
} else {
  fillSample();
}
