import React, { useState, useEffect } from 'react';
import { Table, Button, message, Typography, Row, Col, Input, Tag, Modal, Form, Select } from 'antd';
import { SearchOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Search } = Input;

const UsersListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.code === 200) {
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
      } else {
        message.error(response.data.message || '获取用户列表失败');
      }
    } catch (error) {
      message.error('获取用户列表失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 获取角色列表
  const fetchRoles = async () => {
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
      message.error('获取角色列表失败：' + error.message);
    }
  };

  // 获取用户角色
  const fetchUserRoles = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/users/${userId}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.code === 200) {
        return response.data.data || [];
      } else {
        message.error(response.data.message || '获取用户角色失败');
        return [];
      }
    } catch (error) {
      message.error('获取用户角色失败：' + error.message);
      return [];
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (searchText) {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (user.phone && user.phone.includes(searchText))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchText, users]);

  // 状态标签
  const getStatusTag = (status) => {
    if (status === 1) {
      return <Tag color="green">启用</Tag>;
    } else {
      return <Tag color="red">禁用</Tag>;
    }
  };

  // 编辑用户
  const handleEdit = (user) => {
    setCurrentUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      status: user.status
    });
    setIsEditModalVisible(true);
  };

  // 保存编辑
  const handleEditSave = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`/users/${currentUser.id}`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.code === 200) {
        message.success('更新成功');
        setIsEditModalVisible(false);
        fetchUsers();
      } else {
        message.error(response.data.message || '更新失败');
      }
    } catch (error) {
      // 错误消息优先级：error.response.data.message > error.message > 默认消息
      const errorMsg = error.response?.data?.message || error.message || '更新失败：未知错误';
      message.error(errorMsg);
    }
  };

  // 添加用户
  const handleAdd = () => {
    form.resetFields();
    setIsAddModalVisible(true);
    // 确保弹窗渲染完成后再设置默认值
    setTimeout(() => {
      form.setFieldsValue({ status: 1 });
    }, 0);
  };

  // 保存添加
  const handleAddSave = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('/users', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.code === 200) {
        message.success('添加成功');
        setIsAddModalVisible(false);
        fetchUsers();
      } else {
        message.error(response.data.message || '添加失败');
      }
    } catch (error) {
      // 错误消息优先级：error.response.data.message > error.message > 默认消息
      const errorMsg = error.response?.data?.message || error.message || '添加失败：未知错误';
      message.error(errorMsg);
    }
  };

  // 配置用户角色
  const handleConfigureRoles = async (user) => {
    setCurrentUser(user);
    // 获取用户当前角色
    const userRoleIds = await fetchUserRoles(user.id);
    roleForm.setFieldsValue({ roleIds: userRoleIds });
    setIsRoleModalVisible(true);
  };

  // 保存用户角色配置
  const handleRoleSave = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`/users/${currentUser.id}/roles`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.code === 200) {
        message.success('角色配置成功');
        setIsRoleModalVisible(false);
        fetchUsers(); // 刷新用户列表以更新角色信息
      } else {
        message.error(response.data.message || '角色配置失败');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || '角色配置失败：未知错误';
      message.error(errorMsg);
    }
  };

  // 删除用户
  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      onOk: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.delete(`/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.code === 200) {
            message.success('删除成功');
            fetchUsers();
          } else {
            message.error(response.data.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败：' + error.message);
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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || <Text type="secondary">未设置</Text>,
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => {
        // 检查时间字段是否有效，避免显示Invalid Date
        if (!time) return '-';
        const date = new Date(time);
        return isNaN(date.getTime()) ? '-' : date.toLocaleString();
      },
    },
    {      title: '角色',
      key: 'roles',
      render: (_, record) => {
        if (!record.roleIds || record.roleIds.length === 0) {
          return <Text type="secondary">未配置</Text>;
        }
        return record.roleIds.map(roleId => {
          const role = roles.find(r => r.id === roleId);
          return role ? <Tag key={roleId} color="blue">{role.name}</Tag> : null;
        });
      },
    },
    {      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={<TeamOutlined />} 
            onClick={() => handleConfigureRoles(record)}
            size="small"
          >
            配置角色
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="users-list-container">
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 20 }}>
        <Col flex="auto">
          <Title level={4}>用户列表</Title>
        </Col>
        <Col>
          <Search
            placeholder="搜索用户名/邮箱/手机号"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />} 
            onClick={handleAdd}
          >
            添加用户
          </Button>
        </Col>
        <Col>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchUsers}
            loading={loading}
          >
            刷新
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
      />

      {/* 编辑用户弹窗 */}
      <Modal
        title="编辑用户"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSave}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]}
          >
            <Input placeholder="请输入手机号（选填）" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button onClick={() => setIsEditModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加用户弹窗 */}
      <Modal
        title="添加用户"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSave}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6个字符' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]}
          >
            <Input placeholder="请输入手机号（选填）" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select defaultValue={1}>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button onClick={() => setIsAddModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              添加
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 角色配置弹窗 */}
      <Modal
        title="配置用户角色"
        open={isRoleModalVisible}
        onCancel={() => setIsRoleModalVisible(false)}
        footer={null}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleRoleSave}
        >
          <Form.Item
            name="roleIds"
            label="选择角色"
            rules={[{ required: true, message: '请至少选择一个角色' }]}
          >
            <Select mode="multiple" placeholder="请选择角色">
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button onClick={() => setIsRoleModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <style>
        {`
        .users-list-container {
          padding: 24px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        `}
      </style>
    </div>
  );
};

export default UsersListPage;