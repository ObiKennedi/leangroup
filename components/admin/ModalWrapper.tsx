"use client";

import { ReactNode } from "react";
import styles from "@/styles/OrdersList.module.scss";

interface ModalWrapperProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}

export default function ModalWrapper({ isOpen, title, onClose, children }: ModalWrapperProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>
                <div className={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>
    );
}