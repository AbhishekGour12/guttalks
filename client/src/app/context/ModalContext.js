// context/ModalContext.js
"use client";
import { createContext, useContext, useState, useCallback } from 'react';
import ScheduleCallModal from '../components/ScheduleCallModal'; // adjust path

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within ModalProvider');
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({
    productName: 'GutTalks Root Rx Session',
    productPrice: null,
  });

  const openScheduleModal = useCallback((productName = 'GutTalks Root Rx Session', productPrice = null) => {
    setModalProps({ productName, productPrice });
    setIsScheduleModalOpen(true);
  }, []);

  const closeScheduleModal = useCallback(() => {
    setIsScheduleModalOpen(false);
  }, []);

  return (
    <ModalContext.Provider value={{ isScheduleModalOpen, modalProps, openScheduleModal, closeScheduleModal }}>
      {children}
      <ScheduleCallModal
        isOpen={isScheduleModalOpen}
        onClose={closeScheduleModal}
        productName={modalProps.productName}
        productPrice={modalProps.productPrice}
      />
    </ModalContext.Provider>
  );
};