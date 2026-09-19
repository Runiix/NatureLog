"use client";

import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import Modal from "../../components/general/Modal";

export default function UikitToastDemo() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => toast("Saved")}>
        Success toast
      </Button>
      <Button variant="secondary" onClick={() => toast("Something went wrong", "error")}>
        Error toast
      </Button>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Themed modal
      </Button>
      {open && (
        <Modal title="Themed modal" closeModal={() => setOpen(false)}>
          <p className="text-sm text-fg-muted">Escape, backdrop click and Tab trapping.</p>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Modal>
      )}
    </div>
  );
}
