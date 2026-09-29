import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatMoney(value: unknown) {
  const amount = Number(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: Date) {
  return new Date(value).toLocaleString("en-NG");
}

export default async function AdminCustomerTransactionPage({
  params,
}: {
  params: Promise<{
    id: string;
    transactionId: string;
  }>;
}) {
  const { id, transactionId } = await params;

  const transaction = await prisma.walletTransaction.findFirst({
    where: {
      id: transactionId,
      userId: id,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      wallet: {
        select: {
          id: true,
          balance: true,
        },
      },
    },
  });

  if (!transaction) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/users/${id}`}
          className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
        >
          ← Customer
        </Link>

        <div className="mt-5">
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Transaction Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Full details of this customer transaction.
          </p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {formatMoney(transaction.amount)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Type</p>
          <p className="mt-2 text-lg font-bold text-black">
            {transaction.type}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Status</p>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              transaction.status === "SUCCESS"
                ? "bg-lime-100 text-lime-700"
                : transaction.status === "FAILED"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {transaction.status}
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Gateway</p>
          <p className="mt-2 text-lg font-bold text-black">
            {transaction.gateway}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-bold text-black">
            Transaction Information
          </h2>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Reference</p>
            <p className="mt-1 break-all font-medium text-black">
              {transaction.reference}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Transaction ID</p>
            <p className="mt-1 break-all font-medium text-black">
              {transaction.id}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Gateway</p>
            <p className="mt-1 font-medium text-black">
              {transaction.gateway}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Gateway Transaction ID</p>
            <p className="mt-1 break-all font-medium text-black">
              {transaction.gatewayTransactionId
                ? transaction.gatewayTransactionId.toString()
                : "Not available"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Currency</p>
            <p className="mt-1 font-medium text-black">
              {transaction.currency}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Type</p>
            <p className="mt-1 font-medium text-black">
              {transaction.type}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="mt-1 font-medium text-black">
              {formatDate(transaction.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Last Updated</p>
            <p className="mt-1 font-medium text-black">
              {formatDate(transaction.updatedAt)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-bold text-black">
            Customer
          </h2>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Name</p>
            <p className="mt-1 font-medium text-black">
              {transaction.user.firstName} {transaction.user.lastName}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="mt-1 break-all font-medium text-black">
              {transaction.user.email}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="mt-1 font-medium text-black">
              {transaction.user.phone}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-5">
          <Link
            href={`/admin/users/${transaction.user.id}`}
            className="inline-flex h-10 items-center rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            View Customer
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-bold text-black">
            Description
          </h2>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600">
            {transaction.description || "No description available."}
          </p>
        </div>
      </section>
    </div>
  );
}