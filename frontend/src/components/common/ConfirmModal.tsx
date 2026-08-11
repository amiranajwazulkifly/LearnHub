import Modal from './Modal';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="confirm-modal-title">
      <h2 id="confirm-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-50">
        {title}
      </h2>

      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {cancelLabel}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className={
            variant === 'danger'
              ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700'
              : 'rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-600'
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
