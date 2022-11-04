import { useWeb3React } from "@web3-react/core";
import styled, { useTheme, css } from "styled-components";
import RemoveDelegateModalContent from "./RemoveDelegateModalContent";
import { getReq } from "api";
import { convertAddressToAddrCaip } from "helpers/CaipHelper";
import { useDeviceWidthCheck } from "hooks";
import { Button, Content, H2, H3, Item, Section, Span } from "primaries/SharedStyling";
import React, { useEffect, useState } from "react";
import {
  AiOutlineUserDelete
} from 'react-icons/ai';
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import { useSelector } from "react-redux";
import DelegateInfo from "./DelegateInfo";
import useModal from "hooks/useModal";
import useToast from "hooks/useToast";

const isOwner=(account,delegate)=>{
  return account.toLowerCase() !== delegate.toLowerCase() 
}

const ShowDelegates = () => {
  const { account, chainId } = useWeb3React();
  const [delegatees, setDelegatees] = React.useState([account]);
  const theme = useTheme();
  const [isActiveDelegateDropdown, setIsActiveDelegateDropdown] = React.useState(true);
  const [removeModalOpen, setRemoveModalOpen] = React.useState(false);
  const [delegateToBeRemoved, setDelegateToBeRemoved] = React.useState('');
  const { epnsCommWriteProvider } = useSelector(
    (state) => state.contracts
  );
  const isMobile = useDeviceWidthCheck(700);

  const {
    isModalOpen: isRemoveDelegateModalOpen, 
    showModal: showRemoveDelegateModal, 
    ModalComponent: RemoveDelegateModalComponent} = useModal();

  const removeDelegateToast = useToast();
  const removeDelegate = (walletAddress) => {
    return epnsCommWriteProvider.removeDelegate(walletAddress);
  };

  useEffect(()=>{
    fetchDelegatees()
  },[])

  const fetchDelegatees = async () => {
    try {
      const channelAddressinCAIP = convertAddressToAddrCaip(account, chainId);
      const { data } = await getReq(`/v1/channels/${channelAddressinCAIP}/delegates`);
      if (data?.delegates) {
        const delegateeList = data.delegates.map((delegate) => delegate);
        delegateeList.unshift(account);
        setDelegatees(delegateeList);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const removeDelegateModalOpen = (delegateAddress) => {
    setDelegateToBeRemoved(delegateAddress);
    setRemoveModalOpen(true);
  }
  
  return (
    <>
    <Section>
      <Content padding="20px 0px">
      <Item align="flex-start">
          <DelegatesInfoHeader style={{color : theme.color}}>Channel Delegates </DelegatesInfoHeader>
          <div style={{height:'4px'}}/>
          <DelegatesInfoLabel>
            Delegates that can send notifications on behalf of this channel.
          </DelegatesInfoLabel>
      </Item>
      </Content>
    </Section>
      <Item
        flex="5"
        minWidth="280px"
        align="stretch"
        margin="10px 0px 30px 0px"
        radius={isMobile ? "10px" : "20px"}
        border="1px solid #D4DCEA;"
      >
      {isActiveDelegateDropdown && delegatees && 
        <Item
          flex="5"
          justify="flex-start"
          align="stretch"
        >
          {delegatees.map((delegate,idx) => {
            return (
              <Item
                padding={!isMobile ? "25px":"12px"}
                direction="row"
                justify="space-between"
                key={delegate}
                style={{
                  borderTop: idx !== 0 ? "1px solid rgba(169, 169, 169, 0.5)" : ""
                }}
              >
                <DelegateInfo delegateAddress={delegate} isDelegate={isOwner(account,delegate)} maxWidth={'200px'}/>
                {isOwner(account,delegate) ?
                  <RemoveButton
                    delegateAddress={delegate}
                    removeDelegateModalOpen={removeDelegateModalOpen}
                    showRemoveDelegateModal={showRemoveDelegateModal}
                  /> : 
                  <OwnerButton disabled={true}>
                    Channel Creator
                  </OwnerButton>
                }
              </Item>
            )
          })}
        </Item>
        }
           <RemoveDelegateModalComponent
          InnerComponent={RemoveDelegateModalContent}
          onConfirm={removeDelegate}
          toastObject={removeDelegateToast}
           />
      </Item>
    </>
  )
}

const RemoveButton = ({ delegateAddress, removeDelegateModalOpen,showRemoveDelegateModal }) => {
  const [isHovered,setIsHovered] = useState(false)
  
  const handleMouseOver = () => {
    setIsHovered(true);
  };

  const handleMouseOut = () => {
    setIsHovered(false);
  };
  return (
    
      <RemoveButtonUI onMouseEnter={handleMouseOver} onMouseLeave={handleMouseOut} onClick={() => showRemoveDelegateModal()}>
        {
        isHovered ?
        <div style={{display:'flex',width:'100%',alignItems: 'center',justifyContent: 'center'}}>
          <AiOutlineUserDelete fontSize={15}/>
          <div style={{padding:'3px'}}/>
          <div>
            Remove Delegate 
          </div>
        </div>
          :
            <div style={{color:"#657795",textAlign:'right',width:'100%'}}>
              Delegate
            </div>
        }
      </RemoveButtonUI>
  )
}

const ChannelActionButton = styled.button`
  border: 0;
  outline: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 15px;
  margin: 10px;
  color: #fff;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 400;
  position: relative;
  &:hover {
    opacity: 0.9;
    cursor: pointer;
    pointer: hand;
  }
  &:active {
    opacity: 0.75;
    cursor: pointer;
    pointer: hand;
  }
  ${(props) =>
    props.disabled &&
    css`
      &:hover {
        opacity: 1;
        cursor: default;
        pointer: default;
      }
      &:active {
        opacity: 1;
        cursor: default;
        pointer: default;
      }
    `}
`;

const RemoveButtonUI = styled(ChannelActionButton)`
  background: ${props => props.theme.backgroundBG};
  color: ${props => props.theme.color};
  height: 36px;
  max-width: 164px;
  flex:1; 
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 141%;
  display: flex;
  align-items: center;
  text-align: right;
  padding: 6px 10px 6px 9px;
  gap: 5px;
  
  &:hover {
    opacity: 0.9;
    background: #E93636;
    border-radius: 8px;
  };
    color: #fff;
    cursor: pointer;
  
`;

const OwnerButton = styled(Button)`
  all: unset;
  background: transparent;
  font-weight: 500;
  font-size: 16px;
  color: #CF1C84;
  cursor: auto;
`;

const DelegatesInfoHeader = styled.div`
font-weight: 600;
font-size: 18px;
line-height: 150%;
display: flex;
align-items: center;
color: ${(props) => props.theme.color};
`;

const DelegatesInfoLabel = styled.div`
  font-weight: 400;
  font-size: 15px;
  line-height: 140%;
  color: #657795;
`;

export default ShowDelegates;