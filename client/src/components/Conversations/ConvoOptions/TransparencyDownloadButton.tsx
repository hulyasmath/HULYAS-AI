import { useState, forwardRef } from 'react';
import { FileJson } from 'lucide-react';
import { Spinner } from '@librechat/client';
import { useExportTransparency } from '~/hooks/useTransparency';
import { useToastContext } from '@librechat/client';
import { useLocalize } from '~/hooks';
import download from 'downloadjs';

interface TransparencyDownloadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  conversationId: string | null;
  onDownloadComplete?: () => void;
}

const TransparencyDownloadButton = forwardRef<HTMLButtonElement, TransparencyDownloadButtonProps>(function TransparencyDownloadButton({
  conversationId,
  onDownloadComplete,
  ...props
}, ref) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const exportMutation = useExportTransparency(conversationId);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!conversationId) {
      showToast({
        message: 'No conversation selected',
        status: 'error',
      });
      return;
    }

    setIsDownloading(true);
    try {
      const result = await exportMutation.mutateAsync();
      
      console.log('Transparency export result:', result);
      
      // request.get() returns response.data directly, which should be { success: true, transcript: {...} }
      if (result && result.success && result.transcript) {
        // Create JSON blob and download
        const blob = new Blob([JSON.stringify(result.transcript, null, 2)], {
          type: 'application/json',
        });
        const date = new Date();
        const fileName = `zeq-transparency-${conversationId}-${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(
          date.getHours(),
        ).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}.json`;
        
        download(blob, fileName, 'application/json');
        
        showToast({
          message: 'Transparency transcript downloaded successfully',
          status: 'success',
        });
        
        onDownloadComplete?.();
      } else {
        console.error('Invalid response structure:', result);
        throw new Error(
          result?.error || 'No transcript data received. Make sure you have sent messages in this conversation.'
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download transcript';
      showToast({
        message: errorMessage,
        status: 'error',
      });
      console.error('Error downloading transparency transcript:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      {...props}
      ref={ref}
      onClick={handleDownload}
      disabled={!conversationId || isDownloading || exportMutation.isLoading}
      className="select-item text-sm"
      type="button"
    >
      {isDownloading || exportMutation.isLoading ? (
        <Spinner className="icon-sm mr-2 text-text-primary" />
      ) : (
        <FileJson className="icon-sm mr-2 text-text-primary" />
      )}
      {isDownloading || exportMutation.isLoading
        ? 'Downloading...'
        : 'Download Transparency'}
    </button>
  );
});

export default TransparencyDownloadButton;

