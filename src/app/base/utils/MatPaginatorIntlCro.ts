import { Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";

@Injectable()
export class MatPaginatorIntlCro extends MatPaginatorIntl {
    override itemsPerPageLabel: string = "Số bản ghi trên trang";
    override nextPageLabel = 'Trang trước';
    override previousPageLabel = 'Trang sau';
    override lastPageLabel = 'Trang cuối';
    override firstPageLabel = 'Trang đầu';

    override getRangeLabel = function (page: number, pageSize: number, length: number) {
        let strRs = "";

        if (length === 0 || pageSize === 0) {
            strRs = "0 của " + length;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex =
            startIndex < length
                ? Math.min(startIndex + pageSize, length)
                : startIndex + pageSize;
        strRs = startIndex + 1 + " - " + endIndex + "/" + length + " bản ghi";

        return strRs;
    };
}
