"use client";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import { useTranslations } from "next-intl";

export default function TableBasicDemo() {
    const t = useTranslations("TableBasic");

    const invoices = [
        {
            invoice: "INV001",
            paymentStatus: "paid",
            paymentMethod: "credit_card",
            totalAmount: "$2,500.00"
        },
        {
            invoice: "INV002",
            paymentStatus: "pending",
            paymentMethod: "paypal",
            totalAmount: "$1,200.00"
        },
        {
            invoice: "INV003",
            paymentStatus: "overdue",
            paymentMethod: "bank_transfer",
            totalAmount: "$3,750.00"
        },
    ];

    return (
        <div className="flex gap-4 items-center">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">{t("invoice")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead>{t("method")}</TableHead>
                        <TableHead className="text-right">{t("amount")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.invoice}>
                            <TableCell className="font-medium">{invoice.invoice}</TableCell>
                            <TableCell>{t(`payment_status.${invoice.paymentStatus}`)}</TableCell>
                            <TableCell>{t(`payment_method.${invoice.paymentMethod}`)}</TableCell>
                            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>{t("total")}</TableCell>
                        <TableCell className="text-right">$2,500.00</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}
