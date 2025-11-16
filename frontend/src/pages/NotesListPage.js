import React, { useState, useEffect } from 'react';
import { Table, Button, message, Typography, Row, Col, Input, Modal, Form } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const NotesListPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);

  // 获取笔记列表
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.code === 200) {
        setNotes(response.data.data || []);
        setFilteredNotes(response.data.data || []);
      } else {
        message.error(response.data.message || '获取笔记列表失败');
      }
    } catch (error) {
      message.error('获取笔记列表失败：' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (searchText) {
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [searchText, notes]);

  // 编辑笔记
  const handleEdit = (note) => {
    setCurrentNote(note);
    form.setFieldsValue({
      title: note.title,
      content: note.content || ''
    });
    setIsEditModalVisible(true);
  };

  // 保存编辑
  const handleEditSave = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`/notes/${currentNote.id}`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.code === 200) {
        message.success('更新成功');
        setIsEditModalVisible(false);
        fetchNotes();
      } else {
        message.error(response.data.message || '更新失败');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || '更新失败：未知错误';
      message.error(errorMsg);
    }
  };

  // 添加笔记
  const handleAdd = () => {
    form.resetFields();
    setCurrentNote(null);
    setIsAddModalVisible(true);
  };

  // 保存新增
  const handleAddSave = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('/notes', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.code === 200) {
        message.success('创建成功');
        setIsAddModalVisible(false);
        fetchNotes();
      } else {
        message.error(response.data.message || '创建失败');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || '创建失败：未知错误';
      message.error(errorMsg);
    }
  };

  // 删除笔记
  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该笔记吗？',
      onOk: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.delete(`/notes/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.code === 200) {
            message.success('删除成功');
            fetchNotes();
          } else {
            message.error(response.data.message || '删除失败');
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message || '删除失败：未知错误';
          message.error(errorMsg);
        }
      }
    });
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => {
        if (!content) return <Text type="secondary">无内容</Text>;
        // 只显示前100个字符
        const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
        return <Text>{preview}</Text>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time) => {
        if (!time) return '-';
        const date = new Date(time);
        return isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN');
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (time) => {
        if (!time) return '-';
        const date = new Date(time);
        return isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN');
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>笔记管理</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ marginRight: 8 }}
          >
            新增笔记
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchNotes}
          >
            刷新
          </Button>
        </Col>
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Search
            placeholder="搜索笔记标题或内容"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => {
              if (!e.target.value) {
                setSearchText('');
              }
            }}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredNotes}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      {/* 编辑笔记模态框 */}
      <Modal
        title="编辑笔记"
        open={isEditModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSave}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入笔记标题' }]}
          >
            <Input placeholder="请输入笔记标题" maxLength={200} />
          </Form.Item>
          <Form.Item
            label="内容"
            name="content"
          >
            <TextArea
              placeholder="请输入笔记内容"
              rows={8}
              showCount
              maxLength={10000}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增笔记模态框 */}
      <Modal
        title="新增笔记"
        open={isAddModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSave}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入笔记标题' }]}
          >
            <Input placeholder="请输入笔记标题" maxLength={200} />
          </Form.Item>
          <Form.Item
            label="内容"
            name="content"
          >
            <TextArea
              placeholder="请输入笔记内容"
              rows={8}
              showCount
              maxLength={10000}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotesListPage;

