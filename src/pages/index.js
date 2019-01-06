import React,{ Component } from 'react'
import styles from './index.css';
import { Button,Row,Col,Popconfirm,Modal,Input,InputNumber,Popover } from 'antd'
// const Search = Input.Search;
const InputGroup = Input.InputGroup;

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
      min:0,
      max:0,
      modalStart:0,
      modalEnd:0,
    }
  }

  showModal = (start,end) => {
    this.setState({visible:true,modalEnd:end,modalStart:start});
  }

  hideModal = () => {
    this.setState({visible:false});
  }

  handleOk = () => {
    // console.log('maxMin',this.state.min,this.state.max)
    let { min,max,data } = this.state;
    let index = 0;
    for(let i = 0;i < data.length;i++){
      if(data[i]['start'] <= min && data[i]['end']>=min){
        index = i;
      }
    }
    const start = data[index]['start'];
    const end = data[index]['end'];
    // 和前面的合并,后面不合并
    if(min === data[index-1]['end']+1 && max !== data[index+1]['start']-1){
      data[index-1]['end'] = max;
      data[index]['start'] = max + 1;
    }else if(max === data[index+1]['start']-1 && min !== data[index-1]['end']+1){  // 和后面的合并，前面不合并
      data[index]['end'] = min - 1;
      data[index+1]['start'] = min;
    }else if(max === data[index+1]['start']-1 && min === data[index-1]['end']+1){  // 和前后合并
      data[index-1]['end'] = data[index+1]['end'];
      let newData = data.filter((item,i) => i !== index && i !== index + 1)
      console.log('new',newData)
      data = newData
    }else if(max !== data[index+1]['start']-1 && min !== data[index-1]['end']+1){  // 前后不合并
      let newData = []
      // data[index]['start'] = min;
      // data[index]['end'] = max;
      console.log('data',data)
      for(let i = 0;i < index;i++){
        newData.push(data[i]);
      }
      newData.push({
        start: data[index]['start'],
        end: min-1,
        status: 1,
      })
      newData.push({
        start: min,
        end: max,
        status: 0,
      })
      newData.push({
        start:max+1,
        end:data[index]['end'],
        status:1,
      })
      for(let i = index + 1;i < data.length;i++){
        newData.push(data[i]);
      }
      data = newData;
    }

    console.log('data',data,'index',index);
    this.setState({data,visible:false});

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
      const col = (        
      <Col span={len}>
        {status? (
            (curLen <= 1 ? (
              <button className={styles.mybusy} style={{'font-family': "华文彩云"}} type='primary' onClick={()=>{this.showModal(start,end)}}>{start}</button>
            ):(
              <button className={styles.mybusy} style={{'font-family': "华文彩云"}} type='primary' onClick={()=>{this.showModal(start,end)}}>{start}~{end}</button>
            ))
            
        ):(
          (curLen <= 1 ? (
            <button className={styles.myfree} style={{'font-family': "华文彩云"}} type='primary'>{start}</button>
          ):(
            <button className={styles.myfree} style={{'font-family': "华文彩云"}} type='primary'>{start}~{end}</button>
          ))
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
        <InputNumber style={{ width: 100, textAlign: 'center' }} placeholder="开始地址" onChange={(e)=>{this.setState({min:e})}}/>
        <Input
          style={{
            width: 30, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff',
          }}
          placeholder="~"
          disabled
        />
        <InputNumber style={{ width: 100, textAlign: 'center', borderLeft: 0 }} placeholder="结束地址" onChange={(e)=>{this.setState({max:e})}}/>
      </Modal>
      <Row style={{marginTop:100}}>
        {this.createCol()}
      </Row>
    </div>
  );
  }
}
export default App;