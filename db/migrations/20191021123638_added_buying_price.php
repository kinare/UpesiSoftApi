<?php

use Phinx\Db\Adapter\MysqlAdapter;

class AddedBuyingPrice extends Phinx\Migration\AbstractMigration
{
    public function change()
    {
        $this->table('products', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('buyingPrice', 'double', [
                'null' => true,
                'after' => 'qty',
            ])
        ->changeColumn('price', 'double', [
                'null' => false,
                'default' => '0.00',
                'after' => 'buyingPrice',
            ])
        ->changeColumn('salePrice', 'double', [
                'null' => true,
                'default' => '0.00',
                'after' => 'price',
            ])
        ->changeColumn('unitPrice', 'double', [
                'null' => true,
                'default' => '0.00',
                'after' => 'salePrice',
            ])
        ->changeColumn('taxClassId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'unitPrice',
            ])
        ->changeColumn('businessId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'taxClassId',
            ])
        ->changeColumn('published', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'businessId',
            ])
        ->changeColumn('state', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => '1',
                'after' => 'published',
            ])
        ->changeColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
        ->changeColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
            ->save();
    }
}
