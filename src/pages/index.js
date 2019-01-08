import React,{ Component } from 'react'
import styles from './index.css';
import { Row,Col,Modal,Input,InputNumber,message } from 'antd'
// const Search = Input.Search;
// const InputGroup = Input.InputGroup;

 class App extends Component{
  constructor(){
    super();
    this.state = {
      data:[
      {
        start: 1,
        end: 53,
        status: 0, // 0:free 1:busy
      },
      {
        start: 54,
        end:78,
        status: 1,
      },
      {
        start: 79,
        end: 90,
        status: 0,
      },
      {
        start: 91,
        end: 95,
        status: 1,
      },
      {
        start: 96,
        end: 98,
        status: 1,
      },
      {
        start: 99,
        end: 100,
        status: 1,
      },
      {
        start: 101,
        end: 128,
        status: 0,
      },
    ],
      visible: false,
      visible1: false,
      dispatchLen:0,
      modalStart:0,
      modalEnd:0,
    }
  }

  showModal = (start,end) => {
    this.setState({visible:true,modalEnd:end,modalStart:start});
  }

  showDispatchModal = (start,end) => {
    this.setState({visible1:true,modalEnd:end,modalStart:start});
  }

  hideModal = () => {
    this.setState({visible:false,visible1:false});
  }

  handleOk = () => {
    let { data } = this.state;
    const min = this.state.modalStart;
    const max = this.state.modalEnd;
    let index = 0;
    for(let i = 0;i < data.length;i++){
      if(data[i]['start'] <= min && data[i]['end']>=min){
        index = i;
      }
    }
    if(index === 0){
      if(data[index+1]['status'] === 0){  // 合并后面
        data[index+1]['start'] = min;
        let newData = data.filter((item,i)=> i !== index);
        data = newData;
      }else{  // 不合并
        data[index]['status'] = 0;
      }
    }else if(index === data.length-1){ 
      if(data[index-1]['status'] === 0){ // 合并前面
        data[index-1]['end'] = max;
        let newData = data.filter((item,i)=> i!== index);
        data = newData;
      }else{  // 不合并
        data[index]['status'] = 0;
      }
    }else{
      // 和前面的合并,后面不合并
      if(data[index-1]['status'] === 0 && data[index+1]['status'] === 1){
        data[index-1]['end'] = max;
        let newData = data.filter((item,i)=> i!== index);
        data = newData;
      }else if(data[index-1]['status'] === 1 && data[index+1]['status'] === 0){  // 和后面的合并，前面不合并
        data[index+1]['start'] = min;
        let newData = data.filter((item,i)=> i !== index);
        data = newData;
      }else if(data[index-1]['status'] === 0 && data[index+1]['status'] === 0){  // 和前后合并
        data[index-1]['end'] = data[index+1]['end'];
        let newData = data.filter((item,i) => i !== index && i !== index + 1)
        data = newData
      }else if(data[index-1]['status'] === 1 && data[index+1]['status'] === 1){  // 前后不合并
        data[index]['status'] = 0;
      }
    }
    const freeLen = max - min + 1;
    message.success("释放 "+freeLen+"kb 大小的空间成功")
    this.setState({data,visible:false});
  }

  handleDispatch = () => {
    const { data,dispatchLen } = this.state;
    let chazhi = 10000;
    let bestIndex = -1;
    let newData = [];
    let maxFreeLen = 0;
    for(let i = 0;i < data.length;i++){
      const freeLen = data[i]['end'] - data[i]['start'] + 1;
      if(dispatchLen <= freeLen && data[i]['status'] === 0 && freeLen - dispatchLen < chazhi){
        bestIndex = i;
        chazhi = freeLen - dispatchLen;
      }
    }
    for(let i = 0;i < data.length;i++){
      const freeLen = data[i]['end'] - data[i]['start'] + 1; 
      if(data[i]['status'] === 0 && freeLen > maxFreeLen){
        maxFreeLen = freeLen;
      }
    }
    if(bestIndex < 0 || dispatchLen < 0){
      message.error("没有合适的空间分配,最大可分配空间大小为: "+maxFreeLen);
    }else {
      for(let i = 0;i < bestIndex;i++){
        newData.push(data[i]);
      }
      newData.push({
        start: data[bestIndex]['start'],
        end: data[bestIndex]['start'] + dispatchLen - 1,
        status: 1,
      })
      data[bestIndex]['start'] = newData[bestIndex]['end'] + 1
      for(let i = bestIndex;i < data.length;i++){
        if(data[i]['end'] - data[i]['start'] > -1){
          newData.push(data[i]);
        }
      }
      message.success("申请 "+dispatchLen+"kb 大小的空间成功");
      this.setState({data:newData,visible1:false})
    }
  }

  createCol = () => {
    const { data } = this.state;
    const cols = [];
    const spaceLen = data[data.length-1]['end'] - data[0]['start'] + 1;
    for(let i = 0;i < data.length;i++){
      const start = data[i]['start'];
      const end = data[i]['end'];
      const status = data[i]['status'];
      const curLen = end - start + 1;
      const len = parseInt(24*curLen/spaceLen) ? parseInt(24*curLen/spaceLen): 1;
      const time = `${start}~${end}`;
      const col = (        
      <Col span={len}>
        {status? (
            <button 
              className={styles.mybusy} 
              style={{'font-family': "华文彩云"}} 
              type='primary' 
              onClick={()=>{this.showModal(start,end)}}
            >
              {curLen <=1 ? (start):(time)}
            </button>
        ):(
          <button 
            className={styles.myfree}
            style={{'font-family': "华文彩云"}} 
            type='primary' 
            onClick={() => {this.showDispatchModal(start,end)}}
           >
            {curLen <= 1 ? (start):(time)}
           </button>
        )}
      </Col>)
      cols.push(col)
    }
    return cols;
  }

  render(){
      return (
    <div>
      <Modal
        title="回收内存空间"
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.hideModal}
        okText="确认回收"
        cancelText="取消"
      >
        <p>该内存始末地址: {this.state.modalStart}~{this.state.modalEnd}</p>
        <p>大小: {this.state.modalEnd - this.state.modalStart + 1}</p>
      </Modal>
      <Modal
        title="分配内存空间"
        visible={this.state.visible1}
        onOk={this.handleDispatch}
        onCancel={this.hideModal}
        okText="确认分配"
        cancelText="取消"
      >
        <p>该内存始末地址: {this.state.modalStart}~{this.state.modalEnd}</p>
        <p>大小: {this.state.modalEnd - this.state.modalStart + 1}</p>
        <InputNumber style={{ width: 120, textAlign: 'center' }} placeholder="申请空间大小" onChange={(e)=>{this.setState({dispatchLen:e})}}/>
      </Modal>
      <Row style={{marginTop:100}}>
        {this.createCol()}
      </Row>
    </div>
  );
  }
}
export default App;