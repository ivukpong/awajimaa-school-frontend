import { useState } from 'react';
import { post } from '@/lib/api';
import toast from 'react-hot-toast';

export type UploadType = 'teachers' | 'students' | 'admins';

export interface UploadFailure {
    row: number;
    email: string | null;
    error: string;
}

export interface UploadResult {
    created: number;
    failed: number;
    failures: UploadFailure[];
}

export function useBulkUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);

    const upload = async (type: UploadType, file: File): Promise<boolean> => {
        setIsUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await post<UploadResult>(`/bulk-upload/${type}`, formData);
            setResult(res.data);

            if (res.data.created > 0) {
                toast.success(`${res.data.created} account(s) created and notified by email.`);
            }
            if (res.data.failed > 0) {
                toast.error(`${res.data.failed} row(s) failed. Check the error details below.`);
            }
            return true;
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : 'Upload failed. Please try again.';
            toast.error(msg);
            return false;
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = (type: UploadType) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
        const token =
            typeof document !== 'undefined'
                ? document.cookie
                    .split('; ')
                    .find((r) => r.startsWith('auth_token='))
                    ?.split('=')[1]
                : undefined;

        const url = `${apiUrl}/bulk-upload/template/${type}`;
        const a = document.createElement('a');
        a.href = token ? `${url}?token=${token}` : url;
        a.download = `awajimaa_${type}_template.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const reset = () => setResult(null);

    return { upload, downloadTemplate, isUploading, result, reset };
}
