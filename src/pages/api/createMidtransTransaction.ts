import type { NextApiRequest, NextApiResponse } from 'next/types'

// @ts-ignore: midtrans-client has no type definitions

import midtransClient from 'midtrans-client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { total_amount, dataUsers, dataPayment } = req.body


  const snap = new midtransClient.Snap({
    isProduction: false, // Set to true for production
    serverKey: 'SB-Mid-server-z5T9WhivZDuXrJxC7w-civ_k'
  })
  const orderId = 'ORDER-' + Math.floor(100000 + Math.random() * 900000)
  const itemDetails = dataPayment.map((payment: any) => ({
    id: `ITEM-${payment.id}`, // Membuat ID item unik berdasarkan id payment
    price: payment.total_payment, // Menggunakan amount sebagai harga item
    quantity: 1, // Karena setiap item adalah untuk satu bulan, quantity adalah 1
    name: `Bulan ${payment.month} ${payment.years}` // Nama item sesuai dengan bulan dan tahun pembayaran
  }))
  const transactionDetails = {
    transaction_details: {
      order_id: orderId,
      gross_amount: total_amount // Total pembayaran
    },
    customer_details: {
      first_name: dataUsers.full_name, // Sesuaikan dengan data pengguna
      email: dataUsers.email,
      phone: dataUsers.phone
    },
    item_details: itemDetails
  }
  try {
    const transaction = await snap.createTransaction(transactionDetails)
    res
      .status(200)
      .json({ transactionToken: transaction.token, transactionUrl: transaction.redirect_url, orderId: orderId })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
