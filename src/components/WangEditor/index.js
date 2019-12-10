import React, { PureComponent } from 'react';
import E from 'wangeditor';

let editor = '';

export default class WangEditor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  componentDidMount() {
    editor = new E(this.refs.editorElem);
    // 使用 onchange 函数监听内容的变化，并实时更新到 state 中
    editor.customConfig.onchange = html => {
      this.props.onChangeVal(html);
    }
    editor.customConfig.uploadImgServer = '/upload';
    //多语言
    editor.customConfig.lang = {
      // '设置标题': 'title',
      // '正文': 'p',
      // '链接文字': 'link text',
      // '链接': 'link',
      // '上传图片': 'upload image',
      // '上传': 'upload',
      // '创建': 'init'
      // 还可自定添加更多
    }
    editor.create()
    editor.txt.html(this.state.value)
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.defaultValue != this.state.value){
      this.setState({
        value: nextProps.defaultValue,
      },()=>{
        editor.txt.html(this.state.value);
      })
    }
  }

  render() {
    const {defaultValue} = this.props;
    console.log(defaultValue);
    
    
    return (
      <div className="wang_editor_box">
        {/* 将生成编辑器 */}
        <div ref="editorElem" style={{ textAlign: 'left' }}></div>
      </div>
    );
  }
}
