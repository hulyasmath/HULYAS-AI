import React, { useState, useRef } from 'react';
import { useOnClickOutside } from '@librechat/client';
import ImportConversations from './ImportConversations';
import { RevokeKeys } from './RevokeKeys';
import { DeleteCache } from './DeleteCache';
import { ClearChats } from './ClearChats';
import SharedLinks from './SharedLinks';
import TransparencyPanel from '~/components/ZeqOS/TransparencyPanel';

function Data() {
  const dataTabRef = useRef(null);
  const [confirmClearConvos, setConfirmClearConvos] = useState(false);
  useOnClickOutside(dataTabRef, () => confirmClearConvos && setConfirmClearConvos(false), []);

  return (
    <div className="flex flex-col gap-3 p-1 text-sm text-text-primary">
      <div className="pb-3">
        <ImportConversations />
      </div>
      <div className="pb-3">
        <SharedLinks />
      </div>
      <div className="pb-3">
        <RevokeKeys />
      </div>
      <div className="pb-3">
        <DeleteCache />
      </div>
      <div className="pb-3">
        <ClearChats />
      </div>
      <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
        <TransparencyPanel />
      </div>
    </div>
  );
}

export default React.memo(Data);
