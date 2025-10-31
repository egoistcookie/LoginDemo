import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const RolesListPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 加载角色数据
  const loadRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.code === 200) {
        setRoles(response.data.data);
      } else {
        message.error(response.data.message || '获取角色列表失败');
      }
    } catch (error) {
      message.error('获取角色列表失败');
      console.error('获取角色列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadRoles();
  }, []);

  // 处理添加角色
  const handleAddRole = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑角色
  const handleEditRole = (role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description
    });
    setIsModalVisible(true);
  };

  // 处理删除角色
  const handleDeleteRole = (role) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除角色「${role.name}」吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.delete(`/roles/${role.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.code === 200) {
            message.success('角色删除成功');
            loadRoles(); // 重新加载角色列表
          } else {
            message.error(response.data.message || '角色删除失败');
          }
        } catch (error) {
          console.error('角色删除失败:', error);
          message.error('角色删除失败');
        }
      }
    });
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();
      setConfirmLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (editingRole) {
        // 编辑模式
        const response = await axios.put(`/roles/${editingRole.id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.code === 200) {
          message.success('角色更新成功');
        } else {
          message.error(response.data.message || '角色更新失败');
          return; // 如果失败，不关闭模态框，不重新加载列表
        }
      } else {
        // 添加模式
        const response = await axios.post('/roles', values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.code === 200) {
          message.success('角色添加成功');
        } else {
          message.error(response.data.message || '角色添加失败');
          return; // 如果失败，不关闭模态框，不重新加载列表
        }
      }
      
      setIsModalVisible(false);
      loadRoles(); // 重新加载角色列表
    } catch (error) {
      console.error('角色操作失败:', error);
      message.error(editingRole ? '角色更新失败' : '角色添加失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '角色ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: '角色描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
            style={{ marginRight: 8 }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRole(record)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="roles-list-container">
      <div className="header">
        <Title level={3}>角色列表</Title>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRole}
            style={{ marginRight: 8 }}
          >
            添加角色
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadRoles}
            loading={loading}
          >
            刷新
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个角色`,
        }}
        locale={{
          emptyText: '暂无角色数据',
        }}
      />

      {/* 角色编辑/添加模态框 */}
      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="确定"
        cancelText="取消"
        confirmLoading={confirmLoading}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="角色名称"
            name="name"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            label="角色描述"
            name="description"
          >
            <Input.TextArea placeholder="请输入角色描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .roles-list-container {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default RolesListPage;