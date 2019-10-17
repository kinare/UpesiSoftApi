<?php

use Phinx\Db\Adapter\MysqlAdapter;

class BusinessTaglineAndTerms extends Phinx\Migration\AbstractMigration
{
    public function change()
    {
        $this->table('businesses', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('businessTagline', 'string', [
                'null' => true,
                'limit' => 255,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessLogoImage',
            ])
            ->addColumn('businessTerms', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessTagline',
            ])
        ->changeColumn('state', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => '1',
                'after' => 'businessTerms',
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
